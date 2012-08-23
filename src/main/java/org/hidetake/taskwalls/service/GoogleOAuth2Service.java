package org.hidetake.taskwalls.service;

import java.io.IOException;
import java.util.Date;
import java.util.logging.Logger;

import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.model.oauth2.ClientCredential;
import org.hidetake.taskwalls.util.StackTraceUtil;
import org.hidetake.taskwalls.util.googleapis.HttpResponseExceptionUtil;
import org.hidetake.taskwalls.util.googleapis.JacksonFactoryLocator;
import org.hidetake.taskwalls.util.googleapis.NetHttpTransportLocator;

import com.google.api.client.auth.oauth2.draft10.AccessTokenRequest;
import com.google.api.client.auth.oauth2.draft10.AccessTokenResponse;
import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessTokenRequest.GoogleAuthorizationCodeGrant;
import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessTokenRequest.GoogleRefreshTokenGrant;
import com.google.api.client.http.HttpResponseException;

/**
 * Google API OAuth 2.0 service (server-side flow).
 * 
 * @author hidetake.org
 */
public class GoogleOAuth2Service {

	private static final Logger logger = Logger.getLogger(GoogleOAuth2Service.class.getName());
	private final ClientCredential clientCredential;

	public GoogleOAuth2Service(ClientCredential clientCredential) {
		this.clientCredential = clientCredential;
	}

	/**
	 * Exchange authorization code for token.
	 * 
	 * @param authorizationCode
	 * @param redirectURI
	 * @return session
	 * @throws HttpResponseException
	 * @throws IOException
	 */
	public Session exchange(String authorizationCode, String redirectURI)
			throws HttpResponseException, IOException {
		if (authorizationCode == null) {
			throw new NullPointerException("authorizationCode is null");
		}
		if (redirectURI == null) {
			throw new NullPointerException("redirectURI is null");
		}

		GoogleAuthorizationCodeGrant grant = new GoogleAuthorizationCodeGrant(
				NetHttpTransportLocator.get(),
				JacksonFactoryLocator.get(),
				clientCredential.getClientId(),
				clientCredential.getClientSecret(),
				authorizationCode,
				redirectURI);
		AccessTokenResponse tokenResponse = execute(grant);
		Date expire = new Date(System.currentTimeMillis() + tokenResponse.expiresIn * 1000L);

		Session session = new Session();
		session.setAccessToken(tokenResponse.accessToken);
		session.setRefreshToken(tokenResponse.refreshToken);
		session.setExpiration(expire);
		return session;
	}

	/**
	 * Refresh the token.
	 * 
	 * @param session
	 *            expired session (refresh token should not be null)
	 * @throws HttpResponseException
	 * @throws IOException
	 */
	public void refresh(Session session) throws HttpResponseException, IOException {
		if (session == null) {
			throw new NullPointerException("token is null");
		}
		if (session.getRefreshToken() == null) {
			throw new NullPointerException("refresh token is null");
		}

		GoogleRefreshTokenGrant grant = new GoogleRefreshTokenGrant(
				NetHttpTransportLocator.get(),
				JacksonFactoryLocator.get(),
				clientCredential.getClientId(),
				clientCredential.getClientSecret(),
				session.getRefreshToken());
		AccessTokenResponse tokenResponse = execute(grant);
		Date expire = new Date(System.currentTimeMillis() + tokenResponse.expiresIn * 1000L);

		session.setAccessToken(tokenResponse.accessToken);
		session.setExpiration(expire);
	}

	private static AccessTokenResponse execute(AccessTokenRequest accessTokenRequest)
			throws HttpResponseException, IOException {
		// 1st chance
		try {
			return accessTokenRequest.execute();
		} catch (HttpResponseException e) {
			logger.severe(HttpResponseExceptionUtil.getMessage(e));
			logger.severe(StackTraceUtil.format(e));
		} catch (IOException e) {
			logger.severe(StackTraceUtil.format(e));
		}
		// 2nd chance
		try {
			return accessTokenRequest.execute();
		} catch (HttpResponseException e) {
			logger.severe(HttpResponseExceptionUtil.getMessage(e));
			logger.severe(StackTraceUtil.format(e));
		} catch (IOException e) {
			logger.severe(StackTraceUtil.format(e));
		}
		// last chance
		return accessTokenRequest.execute();
	}

}
