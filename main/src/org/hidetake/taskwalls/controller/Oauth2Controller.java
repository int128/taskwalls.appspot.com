package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.net.URI;
import java.security.MessageDigest;
import java.util.Date;
import java.util.UUID;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.model.oauth2.CachedToken;
import org.hidetake.taskwalls.service.SessionService;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.hidetake.taskwalls.util.googleapis.JacksonFactoryLocator;
import org.hidetake.taskwalls.util.googleapis.NetHttpTransportLocator;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

import com.google.api.client.auth.oauth2.draft10.AccessTokenRequest.AuthorizationCodeGrant;
import com.google.api.client.auth.oauth2.draft10.AccessTokenResponse;
import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessTokenRequest.GoogleAuthorizationCodeGrant;
import com.google.api.client.http.HttpResponseException;

/**
 * Authorize and begin session.
 * @author hidetake.org
 */
public class Oauth2Controller extends Controller
{

	private static final Logger logger = Logger.getLogger(Oauth2Controller.class.getName());

	@Override
	public Navigation run() throws Exception
	{
		if (!isPost()) {
			return forward("/errors/preconditionFailed");
		}
		if (!AjaxPreconditions.isXHR(request)) {
			return forward("/errors/preconditionFailed");
		}
		String authorizationCode = asString("code");
		if (authorizationCode == null) {
			return forward("/errors/preconditionFailed");
		}

		// exchange authorization code and token
		GoogleAuthorizationCodeGrant grant = new GoogleAuthorizationCodeGrant(
				NetHttpTransportLocator.get(),
				JacksonFactoryLocator.get(),
				AppCredential.clientCredential.getClientId(),
				AppCredential.clientCredential.getClientSecret(),
				authorizationCode,
				getRedirectURI());
		AccessTokenResponse tokenResponse = execute(grant);
		Date expire = new Date(System.currentTimeMillis() + tokenResponse.expiresIn * 1000L);
		CachedToken token = new CachedToken(
				tokenResponse.accessToken,
				tokenResponse.refreshToken,
				expire);

		// create session
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		digest.reset();
		digest.update(UUID.randomUUID().toString().getBytes());
		digest.update(AppCredential.clientCredential.getClientId().getBytes());
		digest.update(AppCredential.clientCredential.getClientSecret().getBytes());
		digest.update(authorizationCode.getBytes());
		digest.update(token.getAccessToken().getBytes());
		if (token.getRefreshToken() != null) {
			digest.update(token.getRefreshToken().getBytes());
		}
		StringBuilder sessionIDBuilder = new StringBuilder();
		for (byte b : digest.digest()) {
			sessionIDBuilder.append(Integer.toHexString(b & 0xff));
		}
		String sessionID = sessionIDBuilder.toString();

		Session session = new Session();
		session.setKey(Session.createKey(sessionID));
		session.setToken(token);
		SessionService.put(session);

		// create session cookie
		Cookie cookie = new Cookie(Constants.cookieSessionID, sessionID);
		cookie.setMaxAge(Constants.sessionExpiration);
		response.addCookie(cookie);
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

	private String getRedirectURI()
	{
		return URI.create(request.getRequestURL().toString()).resolve("/").toASCIIString();
	}

	/**
	 * Execute grant with retry.
	 * @param grant
	 * @return
	 * @throws IOException
	 */
	private static AccessTokenResponse execute(AuthorizationCodeGrant grant) throws IOException
	{
		try {
			return grant.execute();
		}
		catch (HttpResponseException e) {
			try {
				logger.warning(e.getResponse().parseAsString());
			}
			catch (IOException e2) {
				// failed to parseAsString()
				logger.warning(e.getLocalizedMessage());
			}
		}
		// 2nd retry
		try {
			return grant.execute();
		}
		catch (HttpResponseException e) {
			try {
				logger.warning(e.getResponse().parseAsString());
			}
			catch (IOException e2) {
				// failed to parseAsString()
				logger.warning(e.getLocalizedMessage());
			}
		}
		// 3rd retry
		return grant.execute();
	}

}
