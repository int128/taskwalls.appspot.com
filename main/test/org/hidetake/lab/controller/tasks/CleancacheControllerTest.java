package org.hidetake.lab.controller.tasks;

import javax.servlet.http.Cookie;

import org.hidetake.lab.service.oauth2.CachedToken;
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
		tester.request.addCookie(new Cookie(ControllerBase.COOKIE_KEY_SESSIONID, "hogeSessionKey"));

		CachedToken token = new CachedToken("hogeAccess", "hogeRefresh");

		Memcache.put("hogeKey", "hogeValue");
		Memcache.put("hogeSessionKey", token);
		assertThat(Memcache.<String> get("hogeKey"), is("hogeValue"));
		assertThat(Memcache.<CachedToken> get("hogeSessionKey").getAccessToken(), is("hogeAccess"));
		assertThat(Memcache.<CachedToken> get("hogeSessionKey").getRefreshToken(),
				is("hogeRefresh"));

		tester.start("/tasks/cleancache");
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
