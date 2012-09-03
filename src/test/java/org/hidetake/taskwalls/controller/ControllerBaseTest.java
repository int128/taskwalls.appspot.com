package org.hidetake.taskwalls.controller;

import static org.hamcrest.CoreMatchers.*;
import static org.hidetake.taskwalls.controller.RequestTestUtil.*;
import static org.junit.Assert.*;

import java.util.UUID;

import javax.servlet.http.HttpServletResponse;

import org.hidetake.taskwalls.Constants;
import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

public class ControllerBaseTest extends ControllerTestCase {

	@Test
	public void notXHR() throws Exception {
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void noSessionHeader() throws Exception {
		setXHR(tester);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void invalidHeader() throws Exception {
		setXHR(tester);
		String sessionID = UUID.randomUUID().toString();
		tester.request.setHeader(Constants.HEADER_SESSION, sessionID);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void sessionEnabled() throws Exception {
		setXHR(tester);
		enableSession(tester);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
	}

	@Test
	public void checkJsonResponse() throws Exception {
		setXHR(tester);
		enableSession(tester);
		tester.param("json", true);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(tester.response.getContentType(), is("application/json"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
		assertThat(tester.response.getHeader("X-Content-Type-Options"), is("nosniff"));
	}

}