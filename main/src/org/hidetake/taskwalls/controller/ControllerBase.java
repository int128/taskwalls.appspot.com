package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.service.oauth2.CachedToken;
import org.hidetake.taskwalls.service.oauth2.JacksonFactoryLocator;
import org.hidetake.taskwalls.service.oauth2.NetHttpTransportLocator;
import org.hidetake.taskwalls.util.GenericJsonWrapper;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;

import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessProtectedResource;
import com.google.api.client.http.HttpResponseException;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.GenericJson;
import com.google.api.client.json.jackson.JacksonFactory;
import com.google.api.services.tasks.Tasks;

/**
 * Base controller class that depends on Google Tasks API.
 * @author hidetake.org
 */
public abstract class ControllerBase extends Controller
{

	protected static final String COOKIE_KEY_SESSIONID = "s";
	private static final Logger logger = Logger.getLogger(ControllerBase.class.getName());

	/**
	 * Session key.
	 */
	protected String sessionKey;

	/**
	 * Tasks API service.
	 */
	protected Tasks taskService;

	@Override
	protected Navigation setUp()
	{
		if (request.getCookies() == null) {
			return forward("invalidRequest");
		}
		sessionKey = null;
		for (Cookie cookie : request.getCookies()) {
			if (COOKIE_KEY_SESSIONID.equals(cookie.getName())) {
				sessionKey = cookie.getValue();
				break;
			}
		}
		if (sessionKey == null) {
			return forward("invalidRequest");
		}

		CachedToken token = Memcache.get(sessionKey);
		if (token == null) {
			return forward("invalidRequest");
		}
		HttpTransport httpTransport = NetHttpTransportLocator.get();
		JacksonFactory jsonFactory = JacksonFactoryLocator.get();
		GoogleAccessProtectedResource resource = new GoogleAccessProtectedResource(
				token.getAccessToken(),
				httpTransport,
				jsonFactory,
				Constants.clientCredential.getClientId(),
				Constants.clientCredential.getClientSecret(),
				token.getRefreshToken());
		taskService = new Tasks(httpTransport, resource, jsonFactory);
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