package org.hidetake.taskwalls.service;

import java.io.IOException;
import java.util.logging.Logger;

import org.hidetake.taskwalls.model.oauth2.ClientCredential;
import org.hidetake.taskwalls.util.StackTraceUtil;
import org.hidetake.taskwalls.util.googleapis.JacksonFactoryLocator;
import org.hidetake.taskwalls.util.googleapis.NetHttpTransportLocator;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
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
	 * @return token response
	 * @throws HttpResponseException
	 * @throws IOException
	 */
	public GoogleTokenResponse exchange(String authorizationCode, String redirectURI)
			throws HttpResponseException, IOException {
		if (authorizationCode == null) {
			throw new NullPointerException("authorizationCode is null");
		}
		if (redirectURI == null) {
			throw new NullPointerException("redirectURI is null");
		}

		GoogleAuthorizationCodeTokenRequest request = new GoogleAuthorizationCodeTokenRequest(
				NetHttpTransportLocator.get(),
				JacksonFactoryLocator.get(),
				clientCredential.getClientId(),
				clientCredential.getClientSecret(),
				authorizationCode,
				redirectURI);
		return execute(request);
	}

	private static GoogleTokenResponse execute(GoogleAuthorizationCodeTokenRequest request)
			throws HttpResponseException, IOException {
		// 1st chance
		try {
			return request.execute();
		} catch (HttpResponseException e) {
			logger.severe(e.getStatusMessage());
			logger.severe(StackTraceUtil.format(e));
		} catch (IOException e) {
			logger.severe(StackTraceUtil.format(e));
		}
		// 2nd chance
		try {
			return request.execute();
		} catch (HttpResponseException e) {
			logger.severe(e.getStatusMessage());
			logger.severe(StackTraceUtil.format(e));
		} catch (IOException e) {
			logger.severe(StackTraceUtil.format(e));
		}
		// last chance
		return request.execute();
	}

}
