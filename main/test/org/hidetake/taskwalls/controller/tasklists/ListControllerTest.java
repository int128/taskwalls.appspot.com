package org.hidetake.taskwalls.controller.tasklists;

import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class ListControllerTest extends ControllerTestCase
{

	@Test
	public void run() throws Exception
	{
		tester.start("/tasks/tasklists/list");
		ListController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
	}

}
