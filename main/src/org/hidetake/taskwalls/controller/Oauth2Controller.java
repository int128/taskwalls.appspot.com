package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.security.MessageDigest;
import java.util.Date;
import java.util.UUID;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.service.oauth2.CachedToken;
import org.hidetake.taskwalls.service.oauth2.JacksonFactoryLocator;
import org.hidetake.taskwalls.service.oauth2.NetHttpTransportLocator;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;

import com.google.api.client.auth.oauth2.draft10.AccessTokenRequest.AuthorizationCodeGrant;
import com.google.api.client.auth.oauth2.draft10.AccessTokenResponse;
import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessTokenRequest.GoogleAuthorizationCodeGrant;
import com.google.api.client.http.HttpResponseException;
import com.google.appengine.api.memcache.Expiration;

/**
 * Authorize and begin session.
 * @author hidetake.org
 */
public class Oauth2Controller extends Controller
{

	private static final Logger logger = Logger.getLogger(Oauth2Controller.class.getName());
	// TODO: move to constants class
	protected static final String COOKIE_SESSIONID = "s";

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
		String requestURL = request.getRequestURL().toString();
		String redirectURI = requestURL.substring(0, requestURL.lastIndexOf('/') + 1);
		GoogleAuthorizationCodeGrant grant = new GoogleAuthorizationCodeGrant(
				NetHttpTransportLocator.get(),
				JacksonFactoryLocator.get(),
				Constants.clientCredential.getClientId(),
				Constants.clientCredential.getClientSecret(),
				authorizationCode,
				redirectURI);
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
		digest.update(Constants.clientCredential.getClientId().getBytes());
		digest.update(Constants.clientCredential.getClientSecret().getBytes());
		digest.update(authorizationCode.getBytes());
		digest.update(token.getAccessToken().getBytes());
		digest.update(token.getRefreshToken().getBytes());
		StringBuilder sessionKeyBuilder = new StringBuilder();
		for (byte b : digest.digest()) {
			sessionKeyBuilder.append(Integer.toHexString(b & 0xff));
		}
		String sessionKey = sessionKeyBuilder.toString();
		Memcache.put(sessionKey, token, Expiration.byDeltaSeconds(Constants.sessionExpiration));

		// create session cookie
		Cookie cookie = new Cookie(Oauth2Controller.COOKIE_SESSIONID, sessionKey);
		cookie.setMaxAge(Constants.sessionExpiration);
		response.addCookie(cookie);
		return null;
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
