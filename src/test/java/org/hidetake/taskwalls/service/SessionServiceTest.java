package org.hidetake.taskwalls.service;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.junit.Assert.assertThat;

import java.util.Date;

import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.model.oauth2.ClientCredential;
import org.junit.Test;
import org.slim3.tester.AppEngineTestCase;

public class SessionServiceTest extends AppEngineTestCase {

	@Test
	public void test_encode_and_decode() throws Exception {
		long now = System.currentTimeMillis();
		Session session = new Session();
		session.setAccessToken("accessToken");
		session.setRefreshToken("refreshToken");
		session.setExpiration(new Date(now));

		String encoded = SessionService.encode(session);
		Session decoded = SessionService.decode(encoded);

		assertThat(decoded.getAccessToken(), is("accessToken"));
		assertThat(decoded.getRefreshToken(), is("refreshToken"));
		assertThat(decoded.getExpiration(), is(notNullValue()));
		assertThat(decoded.getExpiration().getTime(), is(now));
	}

	@Test
	public void test_encrypt_and_decrypt() throws Exception {
		ClientCredential credential = new ClientCredential(
				"ClientCredential#clientId", "ClientCredential#clientSecret");

		long now = System.currentTimeMillis();
		Session session = new Session();
		session.setAccessToken("accessToken");
		session.setRefreshToken("refreshToken");
		session.setExpiration(new Date(now));

		byte[] encrypted = SessionService.encodeAndEncrypt(session, credential);
		Session decoded = SessionService.decryptAndDecode(encrypted, credential);

		assertThat(decoded.getAccessToken(), is("accessToken"));
		assertThat(decoded.getRefreshToken(), is("refreshToken"));
		assertThat(decoded.getExpiration(), is(notNullValue()));
		assertThat(decoded.getExpiration().getTime(), is(now));
	}

	@Test
	public void test_encrypt_and_decrypt_wrongkey() throws Exception {
		ClientCredential credential = new ClientCredential(
				"ClientCredential#clientId", "ClientCredential#clientSecret");
		ClientCredential wrongCredential = new ClientCredential(
				"ClientCredential#clientId", "ClientCredential#clientSecret#wrong");

		long now = System.currentTimeMillis();
		Session session = new Session();
		session.setAccessToken("accessToken");
		session.setRefreshToken("refreshToken");
		session.setExpiration(new Date(now));

		byte[] encrypted = SessionService.encodeAndEncrypt(session, credential);
		Session decoded = SessionService.decryptAndDecode(encrypted, wrongCredential);

		assertThat(decoded, is(nullValue()));
	}

}
