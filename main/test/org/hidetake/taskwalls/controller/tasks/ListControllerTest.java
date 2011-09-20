package org.hidetake.taskwalls.controller.tasks;

import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class ListControllerTest extends ControllerTestCase
{

	/**
	 * Returns 403 if no cookie.
	 * @throws Exception
	 */
	@Test
	public void withoutCookie() throws Exception
	{
		tester.start("/tasks/tasks/list");
		ListController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is("/invalidRequest"));
	}

}
