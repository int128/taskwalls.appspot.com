package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.util.Date;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.service.oauth2.CachedToken;
import org.hidetake.taskwalls.service.oauth2.JacksonFactoryLocator;
import org.hidetake.taskwalls.service.oauth2.NetHttpTransportLocator;
import org.hidetake.taskwalls.util.GenericJsonWrapper;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;

import com.google.api.client.auth.oauth2.draft10.AccessTokenRequest.RefreshTokenGrant;
import com.google.api.client.auth.oauth2.draft10.AccessTokenResponse;
import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessProtectedResource;
import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessTokenRequest.GoogleRefreshTokenGrant;
import com.google.api.client.http.HttpResponseException;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.GenericJson;
import com.google.api.client.json.jackson.JacksonFactory;
import com.google.api.services.tasks.Tasks;
import com.google.appengine.api.memcache.Expiration;

/**
 * Base controller class that depends on Google Tasks API.
 * @author hidetake.org
 */
public abstract class ControllerBase extends Controller
{

	private static final String HEADER_SESSIONID = "X-TaskWall-Session";
	private static final Logger logger = Logger.getLogger(ControllerBase.class.getName());

	/**
	 * Session key.
	 * This field must be initialized at {@link #setUp()}.
	 */
	protected String sessionKey;

	/**
	 * Tasks API service.
	 * This field must be initialized at {@link #setUp()}.
	 */
	protected Tasks tasksService;

	@Override
	protected Navigation setUp()
	{
		sessionKey = request.getHeader(HEADER_SESSIONID);
		if (sessionKey == null) {
			return forward("/errors/noSession");
		}

		CachedToken token = Memcache.get(sessionKey);
		if (token == null) {
			return forward("/errors/noSession");
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

		// refresh the token if expires
		if (new Date().after(token.getExpire())) {
			try {
				GoogleRefreshTokenGrant grant = new GoogleRefreshTokenGrant(
						httpTransport,
						jsonFactory,
						Constants.clientCredential.getClientId(),
						Constants.clientCredential.getClientSecret(),
						token.getRefreshToken());
				AccessTokenResponse tokenResponse = execute(grant);
				Date expire = new Date(System.currentTimeMillis() + tokenResponse.expiresIn * 1000L);
				CachedToken refreshedToken = new CachedToken(
						tokenResponse.accessToken,
						tokenResponse.refreshToken,
						expire);
				Memcache.put(sessionKey, refreshedToken,
						Expiration.byDeltaSeconds(Constants.sessionExpiration));
				resource.setAccessToken(tokenResponse.accessToken);
			}
			catch (IOException e) {
				return forward("/errors/noSession");
			}

			// extends cookie expiration
			Cookie cookie = new Cookie(Oauth2Controller.COOKIE_SESSIONID, sessionKey);
			cookie.setMaxAge(Constants.sessionExpiration);
			response.addCookie(cookie);
		}

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

	/**
	 * Execute grant with retry.
	 * @param grant
	 * @return
	 * @throws IOException
	 */
	private static AccessTokenResponse execute(RefreshTokenGrant grant) throws IOException
	{
		try {
			return grant.execute();
		}
		catch (IOException e) {
			logger.warning(e.getLocalizedMessage());
		}
		// 2nd
		try {
			return grant.execute();
		}
		catch (IOException e) {
			logger.warning(e.getLocalizedMessage());
		}
		// 3rd
		return grant.execute();
	}

}