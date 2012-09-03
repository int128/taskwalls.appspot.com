package org.hidetake.taskwalls.service;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;

import org.hidetake.taskwalls.model.oauth2.ClientCredential;
import org.junit.Test;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;

public class SessionManagerTest {

	@Test
	public void test_serialize_and_restore() throws Exception {
		ClientCredential credential = new ClientCredential(
				"ClientCredential#clientId", "ClientCredential#clientSecret");

		GoogleTokenResponse tokenResponse = new GoogleTokenResponse();
		tokenResponse.setAccessToken("accessToken");
		tokenResponse.setRefreshToken("refreshToken");
		tokenResponse.setExpiresInSeconds(3600L);

		String session = SessionManager.serialize(tokenResponse, credential);
		GoogleTokenResponse decoded = SessionManager.restore(session, credential);

		assertThat(decoded.getAccessToken(), is("accessToken"));
		assertThat(decoded.getRefreshToken(), is("refreshToken"));
		assertThat(decoded.getExpiresInSeconds(), is(3600L));
	}

	@Test
	public void test_serialize_and_restore_wrongkey() throws Exception {
		ClientCredential credential = new ClientCredential(
				"ClientCredential#clientId", "ClientCredential#clientSecret");
		ClientCredential wrongCredential = new ClientCredential(
				"ClientCredential#clientId", "ClientCredential#clientSecret#wrong");

		GoogleTokenResponse tokenResponse = new GoogleTokenResponse();
		tokenResponse.setAccessToken("accessToken");
		tokenResponse.setRefreshToken("refreshToken");
		tokenResponse.setExpiresInSeconds(3600L);

		String session = SessionManager.serialize(tokenResponse, credential);
		GoogleTokenResponse decoded = SessionManager.restore(session, wrongCredential);

		assertThat(decoded, is(nullValue()));
	}

}
