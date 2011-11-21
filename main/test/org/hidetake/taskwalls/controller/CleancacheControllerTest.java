package org.hidetake.taskwalls.controller;

import java.util.Date;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.service.oauth2.CachedToken;
import org.junit.Test;
import org.slim3.memcache.Memcache;
import org.slim3.tester.ControllerTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class CleancacheControllerTest extends ControllerTestCase
{

	@Test
	public void run() throws Exception
	{
		tester.request.addCookie(new Cookie(Oauth2Controller.COOKIE_SESSIONID, "hogeSessionKey"));

		Date expire = new Date(System.currentTimeMillis() + 3600 * 1000L);
		CachedToken token = new CachedToken("hogeAccess", "hogeRefresh", expire);

		Memcache.put("hogeKey", "hogeValue");
		Memcache.put("hogeSessionKey", token);
		assertThat(Memcache.<String> get("hogeKey"), is("hogeValue"));
		assertThat(Memcache.<CachedToken> get("hogeSessionKey").getAccessToken(), is("hogeAccess"));
		assertThat(Memcache.<CachedToken> get("hogeSessionKey").getRefreshToken(),
				is("hogeRefresh"));

		tester.start("/cleancache");
		CleancacheController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));

		assertThat(Memcache.get("hogeKey"), is(nullValue()));
		assertThat(Memcache.<CachedToken> get("hogeSessionKey").getAccessToken(), is("hogeAccess"));
		assertThat(Memcache.<CachedToken> get("hogeSessionKey").getRefreshToken(),
				is("hogeRefresh"));
	}

}
