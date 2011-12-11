package org.hidetake.taskwalls.controller;

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
import org.hidetake.taskwalls.util.googleapis.HttpResponseExceptionUtil;
import org.hidetake.taskwalls.util.googleapis.JacksonFactoryLocator;
import org.hidetake.taskwalls.util.googleapis.NetHttpTransportLocator;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

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
			logger.warning("Precondition failed: not POST");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}
		if (!AjaxPreconditions.isXHR(request)) {
			logger.warning("Precondition failed: not XHR");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}
		String authorizationCode = asString("code");
		if (authorizationCode == null) {
			logger.warning("Precondition failed: code is null");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}

		// exchange authorization code and token
		GoogleAuthorizationCodeGrant grant = new GoogleAuthorizationCodeGrant(
				NetHttpTransportLocator.get(),
				JacksonFactoryLocator.get(),
				AppCredential.CLIENT_CREDENTIAL.getClientId(),
				AppCredential.CLIENT_CREDENTIAL.getClientSecret(),
				authorizationCode,
				getRedirectURI());
		AccessTokenResponse tokenResponse;
		try {
			tokenResponse = grant.execute();
		}
		catch (HttpResponseException e) {
			logger.severe(HttpResponseExceptionUtil.getMessage(e));
		}
		try {
			tokenResponse = grant.execute();
		}
		catch (HttpResponseException e) {
			logger.severe(HttpResponseExceptionUtil.getMessage(e));
		}
		tokenResponse = grant.execute();
		Date expire = new Date(System.currentTimeMillis() + tokenResponse.expiresIn * 1000L);
		CachedToken token = new CachedToken(
				tokenResponse.accessToken,
				tokenResponse.refreshToken,
				expire);

		// create session
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		digest.reset();
		digest.update(UUID.randomUUID().toString().getBytes());
		digest.update(AppCredential.CLIENT_CREDENTIAL.getClientId().getBytes());
		digest.update(AppCredential.CLIENT_CREDENTIAL.getClientSecret().getBytes());
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
		Cookie cookie = new Cookie(Constants.COOKIE_SESSION_ID, sessionID);
		cookie.setMaxAge(Constants.SESSION_EXPIRATION);
		response.addCookie(cookie);
		return null;
	}

	protected String getRedirectURI()
	{
		return URI.create(request.getRequestURL().toString()).resolve("/").toASCIIString();
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
