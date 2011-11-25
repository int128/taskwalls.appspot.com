package org.hidetake.taskwalls.controller;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.util.logging.Logger;

import org.hidetake.taskwalls.service.oauth2.CachedToken;
import org.hidetake.taskwalls.service.oauth2.JacksonFactoryLocator;
import org.hidetake.taskwalls.service.oauth2.NetHttpTransportLocator;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;
import org.slim3.memcache.Memcache;

import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessProtectedResource;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpMethod;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpResponse;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.json.JsonFactory;

/**
 * Proxy endpoint for Google APIs.
 * @author hidetake.org
 */
public class GoogleApiProxyController extends ControllerBase
{

	private static final Logger logger = Logger.getLogger(GoogleApiProxyController.class.getName());
	private static final String BASE_URI = "https://www.googleapis.com";

	@Override
	public Navigation run() throws Exception
	{
		// preconditions
		if (!isPost()) {
			logger.warning("request must be POST");
			return forward("/errors/preconditionFailed");
		}
		if (!AjaxPreconditions.isXHR(request)) {
			logger.warning("request must be via XHR");
			return forward("/errors/preconditionFailed");
		}
		if (!validate()) {
			return forward("/errors/preconditionFailed");
		}
		String uri = BASE_URI + asString("path");
		HttpMethod method = HttpMethod.valueOf(request.getHeader("X-HTTP-Method-Override"));
		if (method == null) {
			logger.warning("invalid method: " + request.getHeader("X-HTTP-Method-Override"));
			return forward("/errors/preconditionFailed");
		}

		// make a request
		HttpTransport httpTransport = NetHttpTransportLocator.get();
		JsonFactory jsonFactory = JacksonFactoryLocator.get();
		CachedToken token = Memcache.get(sessionKey);
		GoogleAccessProtectedResource resource = new GoogleAccessProtectedResource(
				token.getAccessToken(),
				httpTransport,
				jsonFactory,
				AppCredential.clientCredential.getClientId(),
				AppCredential.clientCredential.getClientSecret(),
				token.getRefreshToken());
		HttpRequest proxyRequest = httpTransport.createRequestFactory().buildRequest(
				method,
				new GenericUrl(uri),
				new InputStreamContent(request.getContentType(), request.getInputStream()));
		resource.initialize(proxyRequest);

		// transfer the response
		HttpResponse proxyResponse = proxyRequest.execute();
		response.setStatus(proxyResponse.getStatusCode());
		response.setContentType(proxyResponse.getContentType());
		response.setCharacterEncoding(proxyResponse.getContentEncoding());
		if (proxyResponse.getContent() != null) {
			BufferedInputStream inputStream = new BufferedInputStream(proxyResponse.getContent());
			BufferedOutputStream outputStream = new BufferedOutputStream(response.getOutputStream());
			byte[] buf = new byte[1024];
			for (;;) {
				int bytes = inputStream.read(buf);
				if (bytes == -1) {
					break;
				}
				outputStream.write(buf, 0, bytes);
			}
			outputStream.close();
			inputStream.close();
		}
		return null;
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("path", v.required(), v.regexp("^/.+"), v.maxlength(256));
		return v.validate();
	}

}
