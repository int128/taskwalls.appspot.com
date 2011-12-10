package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.util.Date;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.model.oauth2.CachedToken;
import org.hidetake.taskwalls.service.SessionService;
import org.hidetake.taskwalls.util.googleapis.HttpResponseExceptionUtil;
import org.hidetake.taskwalls.util.googleapis.JacksonFactoryLocator;
import org.hidetake.taskwalls.util.googleapis.NetHttpTransportLocator;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.util.ThrowableUtil;

import com.google.api.client.auth.oauth2.draft10.AccessTokenResponse;
import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessProtectedResource;
import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessTokenRequest.GoogleRefreshTokenGrant;
import com.google.api.client.http.HttpResponseException;
import com.google.api.client.http.json.JsonHttpRequest;
import com.google.api.client.http.json.JsonHttpRequestInitializer;
import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.Tasks;
import com.google.api.services.tasks.TasksRequest;

/**
 * Base controller class that depends on Google Tasks API.
 * @author hidetake.org
 */
public abstract class ControllerBase extends Controller
{

	private static final Logger logger = Logger.getLogger(ControllerBase.class.getName());

	/**
	 * Tasks API service.
	 * This field must be initialized at {@link #setUp()}.
	 */
	protected Tasks tasksService;

	/**
	 * Returns JSON response.
	 * This method checks the request is XHR.
	 * @param object object to serialize as JSON
	 * @return always null
	 * @throws IOException
	 */
	protected Navigation jsonResponse(GenericJson object) throws IOException
	{
		response.setHeader("X-Content-Type-Options", "nosniff");
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		if (object == null) {
			response.getWriter().append("null");
		}
		else {
			response.getWriter().append(object.toString());
		}
		response.flushBuffer();
		return null;
	}

	@Override
	protected Navigation setUp()
	{
		try {
			return setUpServices();
		}
		catch (IOException e) {
			throw ThrowableUtil.wrap(e);
		}
	}

	protected Navigation setUpServices() throws IOException
	{
		String sessionID = request.getHeader(Constants.HEADER_SESSION_ID);
		if (sessionID == null) {
			logger.warning("Precondition failed: no session ID");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}
		Session session = SessionService.get(sessionID);
		if (session == null) {
			logger.warning("Session has been expired or not found");
			response.sendError(Constants.STATUS_NO_SESSION);
			return null;
		}

		// refresh the token if expires
		CachedToken token = session.getToken();
		if (new Date().after(token.getExpire())) {
			GoogleRefreshTokenGrant grant = new GoogleRefreshTokenGrant(
					NetHttpTransportLocator.get(),
					JacksonFactoryLocator.get(),
					AppCredential.CLIENT_CREDENTIAL.getClientId(),
					AppCredential.CLIENT_CREDENTIAL.getClientSecret(),
					token.getRefreshToken());
			// retry 3 times
			AccessTokenResponse tokenResponse;
			try {
				tokenResponse = grant.execute();
			}
			catch (HttpResponseException e) {
				logger.warning(HttpResponseExceptionUtil.getMessage(e));
			}
			try {
				tokenResponse = grant.execute();
			}
			catch (HttpResponseException e) {
				logger.warning(HttpResponseExceptionUtil.getMessage(e));
			}
			tokenResponse = grant.execute();
			// alter the token
			Date expire = new Date(System.currentTimeMillis() + tokenResponse.expiresIn * 1000L);
			CachedToken newToken = new CachedToken(
					tokenResponse.accessToken,
					token.getRefreshToken(),
					expire);
			session.setToken(newToken);
			SessionService.put(session);
			token = newToken;
			// extends cookie life time
			Cookie cookie = new Cookie(Constants.COOKIE_SESSION_ID, sessionID);
			cookie.setMaxAge(Constants.SESSION_EXPIRATION);
			response.addCookie(cookie);
		}

		GoogleAccessProtectedResource resource = new GoogleAccessProtectedResource(
				token.getAccessToken(),
				NetHttpTransportLocator.get(),
				JacksonFactoryLocator.get(),
				AppCredential.CLIENT_CREDENTIAL.getClientId(),
				AppCredential.CLIENT_CREDENTIAL.getClientSecret(),
				token.getRefreshToken());
		JsonHttpRequestInitializer requestInitializer = new JsonHttpRequestInitializer()
		{
			@Override
			public void initialize(JsonHttpRequest jsonHttpRequest) throws IOException
			{
				TasksRequest tasksRequest = (TasksRequest) jsonHttpRequest;
				tasksRequest.setUserIp(request.getRemoteAddr());
			}
		};
		tasksService = Tasks.builder(NetHttpTransportLocator.get(), JacksonFactoryLocator.get())
				.setHttpRequestInitializer(resource)
				.setJsonHttpRequestInitializer(requestInitializer)
				.build();
		return null;
	}

	@Override
	protected Navigation handleError(Throwable e) throws Throwable
	{
		if (e instanceof HttpResponseException) {
			logger.severe(HttpResponseExceptionUtil.getMessage((HttpResponseException) e));
		}
		return super.handleError(e);
	}

}