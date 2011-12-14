package org.hidetake.taskwalls.controller;

import java.util.UUID;

import org.hidetake.taskwalls.Constants;
import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class ControllerBaseTest extends ControllerTestCase {

	@Test
	public void noSessionHeader() throws Exception {
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void sessionExpired() throws Exception {
		String sessionID = UUID.randomUUID().toString();
		tester.request.setHeader(Constants.HEADER_SESSION_ID, sessionID);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_NO_SESSION));
	}

	@Test
	public void sessionEnabled() throws Exception {
		RequestTestUtil.enableSession(tester);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
	}

	@Test
	public void jsonResponse() throws Exception {
		RequestTestUtil.enableSession(tester);
		tester.param("json", true);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getContentType(), is("application/json"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
		assertThat(tester.response.getHeader("X-Content-Type-Options"), is("nosniff"));
	}

}