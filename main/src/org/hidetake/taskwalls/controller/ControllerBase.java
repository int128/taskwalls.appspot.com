package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.util.logging.Logger;

import org.hidetake.taskwalls.service.oauth2.JacksonFactoryLocator;
import org.hidetake.taskwalls.service.oauth2.NetHttpTransportLocator;
import org.hidetake.taskwalls.util.GenericJsonWrapper;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessProtectedResource;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpResponse;
import com.google.api.client.http.HttpResponseException;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.json.JsonHttpParser;
import com.google.api.client.json.GenericJson;
import com.google.api.client.json.jackson.JacksonFactory;
import com.google.api.client.util.GenericData;
import com.google.api.services.tasks.Tasks;

/**
 * Base controller class that depends on Google Tasks API.
 * @author hidetake.org
 */
public abstract class ControllerBase extends Controller
{

	private static final String HEADER_SESSIONID = "X-TaskWall-Token";
	private static final Logger logger = Logger.getLogger(ControllerBase.class.getName());

	/**
	 * Session key.
	 */
	protected String sessionKey;

	/**
	 * Tasks API service.
	 */
	protected Tasks tasksService;

	@Override
	protected Navigation setUp()
	{
		// TODO: fix name
		sessionKey = request.getHeader(HEADER_SESSIONID);
		if (sessionKey == null) {
			return forward("/errors/noSession");
		}

		HttpTransport httpTransport = NetHttpTransportLocator.get();
		JacksonFactory jsonFactory = JacksonFactoryLocator.get();

		// validate the token
		try {
			GenericUrl validationUrl = new GenericUrl(
					"https://www.googleapis.com/oauth2/v1/tokeninfo");
			validationUrl.put("access_token", sessionKey);
			HttpRequest validationRequest = httpTransport.createRequestFactory()
					.buildGetRequest(validationUrl);
			validationRequest.addParser(new JsonHttpParser(jsonFactory));
			HttpResponse validationResponse = validationRequest.execute();
			GenericData data = validationResponse.parseAs(GenericData.class);
			String audience = (String) data.get("audience");
			if (!Constants.clientCredential.getClientId().equals(audience)) {
				logger.warning("Invalid token: " + data.get("error"));
				return forward("/errors/noSession");
			}
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}

		GoogleAccessProtectedResource resource = new GoogleAccessProtectedResource(
				sessionKey,
				httpTransport,
				jsonFactory,
				Constants.clientCredential.getClientId(),
				Constants.clientCredential.getClientSecret(),
				sessionKey);
		tasksService = new Tasks(httpTransport, resource, jsonFactory);
		return null;
	}

	/**
	 * Returns JSON response.
	 * This method checks the request is XHR.
	 * @param object object to serialize as JSON
	 * @return always null
	 * @throws IOException
	 */
	protected Navigation jsonResponse(GenericJson object) throws IOException
	{
		String json = GenericJsonWrapper.toString(object);
		response.setHeader("X-Content-Type-Options", "nosniff");
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().append(json);
		response.flushBuffer();
		return null;
	}

	@Override
	protected Navigation handleError(Throwable e) throws Throwable
	{
		if (e instanceof HttpResponseException) {
			HttpResponseException httpResponseException = (HttpResponseException) e;
			logger.warning(httpResponseException.getResponse().parseAsString());
		}
		return super.handleError(e);
	}

}