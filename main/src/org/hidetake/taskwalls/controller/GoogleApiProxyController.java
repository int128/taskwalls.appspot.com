package org.hidetake.taskwalls.controller;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;

import org.hidetake.taskwalls.service.oauth2.CachedToken;
import org.hidetake.taskwalls.service.oauth2.JacksonFactoryLocator;
import org.hidetake.taskwalls.service.oauth2.NetHttpTransportLocator;
import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;

import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessProtectedResource;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpMethod;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpResponse;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.json.jackson.JacksonFactory;

/**
 * Proxy endpoint for Google APIs.
 * @author hidetake.org
 */
public class GoogleApiProxyController extends ControllerBase
{

	private static final String BASE_URI = "https://www.googleapis.com";

	@Override
	public Navigation run() throws Exception
	{
		String uri = BASE_URI + asString("path");
		HttpMethod method = HttpMethod.valueOf(request.getHeader("X-HTTP-Method-Override"));
		if (method == null) {
			throw new IllegalArgumentException(
					"Invalid method: " + request.getHeader("X-HTTP-Method-Override"));
		}

		// make a request
		HttpTransport httpTransport = NetHttpTransportLocator.get();
		JacksonFactory jsonFactory = JacksonFactoryLocator.get();
		CachedToken token = Memcache.get(sessionKey);
		GoogleAccessProtectedResource resource = new GoogleAccessProtectedResource(
				token.getAccessToken(),
				httpTransport,
				jsonFactory,
				Constants.clientCredential.getClientId(),
				Constants.clientCredential.getClientSecret(),
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

}
