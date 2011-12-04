package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.service.SessionService;
import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class LogoutControllerTest extends ControllerTestCase
{

	@Test
	public void logoutSession() throws Exception
	{
		String sessionID = RequestTestUtil.enableSession(tester);
		assertThat(SessionService.get(sessionID), is(notNullValue()));
		tester.start("/logout");
		LogoutController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(true));
		assertThat(tester.getDestinationPath(), is("/"));
		assertThat(tester.response.getCookies().length, is(not(0)));
		assertThat(tester.response.getCookies()[0].getMaxAge(), is(0));
		assertThat(SessionService.get(sessionID), is(nullValue()));
	}

	@Test
	public void doNotionWhenNoSession() throws Exception
	{
		tester.start("/logout");
		LogoutController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(true));
		assertThat(tester.getDestinationPath(), is("/"));
		assertThat(tester.response.getCookies().length, is(0));
	}

}
