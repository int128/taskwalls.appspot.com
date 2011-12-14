package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.Constants;
import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class Oauth2ControllerTest extends ControllerTestCase {

	@Test
	public void withoutCode() throws Exception {
		tester.start("/oauth2");
		Oauth2Controller controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	// @Test
	public void withCode() throws Exception {
		// TODO: how to test OAuth2?
	}

}
