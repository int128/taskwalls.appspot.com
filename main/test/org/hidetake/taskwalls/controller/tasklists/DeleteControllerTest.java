package org.hidetake.taskwalls.controller.tasklists;

import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class DeleteControllerTest extends ControllerTestCase
{

	@Test
	public void noSession() throws Exception
	{
		tester.start("/tasklists/delete");
		DeleteController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is("/errors/noSession"));
	}

}