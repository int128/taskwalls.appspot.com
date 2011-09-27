package org.hidetake.taskwalls.controller.tasks.update;

import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class TitleControllerTest extends ControllerTestCase
{

	@Test
	public void noSession() throws Exception
	{
		tester.start("/tasks/update/title");
		TitleController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is("/errors/noSession"));
	}

}