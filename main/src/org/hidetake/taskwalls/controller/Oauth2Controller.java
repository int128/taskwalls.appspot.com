package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.security.MessageDigest;
import java.util.UUID;
import java.util.logging.Logger;

import org.hidetake.taskwalls.service.oauth2.CachedToken;
import org.hidetake.taskwalls.service.oauth2.JacksonFactoryLocator;
import org.hidetake.taskwalls.service.oauth2.NetHttpTransportLocator;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;

import com.google.api.client.auth.oauth2.draft10.AccessTokenRequest.AuthorizationCodeGrant;
import com.google.api.client.auth.oauth2.draft10.AccessTokenResponse;
import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessTokenRequest.GoogleAuthorizationCodeGrant;
import com.google.api.client.http.HttpResponseException;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.jackson.JacksonFactory;
import com.google.api.client.util.Base64;

/**
 * OAuth 2.0 authorization redirect point.
 * @author hidetake.org
 */
public class Oauth2Controller extends Controller
{

	private static final Logger logger = Logger.getLogger(Oauth2Controller.class.getName());

	@Override
	public Navigation run() throws Exception
	{
		String authorizationCode = asString("code");
		if (authorizationCode == null) {
			response.sendError(403);
			return null;
		}

		// exchange authorization code and token
		HttpTransport httpTransport = NetHttpTransportLocator.get();
		JacksonFactory jsonFactory = JacksonFactoryLocator.get();
		GoogleAuthorizationCodeGrant grant = new GoogleAuthorizationCodeGrant(
				httpTransport,
				jsonFactory,
				Constants.clientCredential.getClientId(),
				Constants.clientCredential.getClientSecret(),
				authorizationCode,
				request.getRequestURL().toString());
		AccessTokenResponse tokenResponse = execute(grant);
		CachedToken token = new CachedToken(tokenResponse.accessToken, tokenResponse.refreshToken);

		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		digest.reset();
		digest.update(UUID.randomUUID().toString().getBytes());
		digest.update(Constants.clientCredential.getClientId().getBytes());
		digest.update(Constants.clientCredential.getClientSecret().getBytes());
		digest.update(authorizationCode.getBytes());
		digest.update(token.getAccessToken().getBytes());
		digest.update(token.getRefreshToken().getBytes());
		byte[] encoded = Base64.encode(digest.digest());
		// remove padding character
		String sessionKey = new String(encoded, 0, encoded.length - 1);
		Memcache.put(sessionKey, token);

		return redirect("./#s=" + sessionKey);
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
