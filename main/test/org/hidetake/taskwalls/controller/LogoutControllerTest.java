package org.hidetake.taskwalls.controller;

import javax.servlet.http.Cookie;

import org.slim3.tester.ControllerTestCase;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

public class LogoutControllerTest extends ControllerTestCase
{

	@Test
	public void run() throws Exception
	{
		tester.request.addCookie(new Cookie(ControllerBase.COOKIE_KEY_SESSIONID, "hogeSessionKey"));
		tester.start("/logout");
		LogoutController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(true));
		assertThat(tester.getDestinationPath(), is("./"));
		assertThat(tester.response.getCookies()[0].getMaxAge(), is(0));
	}

}
