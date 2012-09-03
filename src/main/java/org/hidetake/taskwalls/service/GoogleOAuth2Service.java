package org.hidetake.taskwalls.service;

import java.io.IOException;
import java.util.logging.Logger;

import org.hidetake.taskwalls.model.oauth2.ClientCredential;
import org.hidetake.taskwalls.util.StackTraceUtil;
import org.hidetake.taskwalls.util.googleapis.HttpTransportLocator;
import org.hidetake.taskwalls.util.googleapis.JsonFactoryLocator;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.HttpResponseException;

/**
 * Google API OAuth 2.0 service (Authorization Code Flow).
 * 
 * @author hidetake.org
 */
public class GoogleOAuth2Service {

	private static final Logger logger = Logger.getLogger(GoogleOAuth2Service.class.getName());

	/**
	 * Exchange authorization code for token.
	 * 
	 * @param authorizationCode
	 * @param redirectURI
	 * @param clientCredential
	 * @return token response
	 * @throws HttpResponseException
	 * @throws IOException
	 */
	public static GoogleTokenResponse exchange(
			String authorizationCode, String redirectURI, ClientCredential clientCredential)
			throws HttpResponseException, IOException {
		GoogleAuthorizationCodeTokenRequest request = new GoogleAuthorizationCodeTokenRequest(
				HttpTransportLocator.get(),
				JsonFactoryLocator.get(),
				clientCredential.getClientId(),
				clientCredential.getClientSecret(),
				authorizationCode,
				redirectURI);
		return execute(request);
	}

	/**
	 * Build a credential from token response.
	 * 
	 * @param tokenResponse
	 * @param clientCredential
	 * @return credential to access protected resources
	 */
	public static GoogleCredential buildCredential(GoogleTokenResponse tokenResponse, ClientCredential clientCredential) {
		return new GoogleCredential.Builder()
				.setTransport(HttpTransportLocator.get())
				.setJsonFactory(JsonFactoryLocator.get())
				.setClientSecrets(clientCredential.getClientId(), clientCredential.getClientSecret())
				.build()
				.setFromTokenResponse(tokenResponse);
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

	private GoogleOAuth2Service() {
	}

}
