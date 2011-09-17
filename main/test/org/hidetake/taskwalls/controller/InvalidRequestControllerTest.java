package org.hidetake.taskwalls.controller;

import org.slim3.tester.ControllerTestCase;
import org.junit.Test;
import static org.junit.Assert.*;

import static org.hamcrest.CoreMatchers.*;

public class InvalidRequestControllerTest extends ControllerTestCase
{

	@Test
	public void run() throws Exception
	{
		tester.start("/invalidRequest");
		InvalidRequestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(403));
	}

}
