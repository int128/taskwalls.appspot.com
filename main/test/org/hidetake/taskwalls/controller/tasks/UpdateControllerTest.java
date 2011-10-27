package org.hidetake.taskwalls.controller.tasks;

import org.slim3.tester.ControllerTestCase;
import org.junit.Test;
import static org.junit.Assert.*;

import static org.hamcrest.CoreMatchers.*;

public class UpdateControllerTest extends ControllerTestCase
{

	@Test
	public void run() throws Exception
	{
		tester.start("/tasks/update");
		UpdateController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is("/errors/noSession"));
	}

}