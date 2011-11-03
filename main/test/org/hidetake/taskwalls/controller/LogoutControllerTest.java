package org.hidetake.taskwalls.controller;

import javax.servlet.http.Cookie;

import org.slim3.memcache.Memcache;
import org.slim3.tester.ControllerTestCase;
import org.hidetake.taskwalls.service.oauth2.CachedToken;
import org.junit.Test;
import static org.junit.Assert.*;

import static org.hamcrest.CoreMatchers.*;

public class LogoutControllerTest extends ControllerTestCase
{

	@Test
	public void run() throws Exception
	{
		CachedToken token = new CachedToken("hogeAccess", "hogeRefresh");
		Memcache.put("hogeSessionKey", token);
		tester.request.addCookie(new Cookie(Oauth2Controller.COOKIE_SESSIONID, "hogeSessionKey"));
		tester.start("/logout");
		LogoutController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(true));
		assertThat(tester.getDestinationPath(), is("./"));
		assertThat(tester.response.getCookies()[0].getMaxAge(), is(0));
		assertThat(Memcache.<CachedToken> get("hogeSessionKey"), is(nullValue()));
	}

}
