package org.hidetake.taskwalls.model;

import org.slim3.tester.AppEngineTestCase;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

public class TasklistOptionsTest extends AppEngineTestCase
{

	private TasklistOptions model = new TasklistOptions();

	@Test
	public void test() throws Exception
	{
		assertThat(model, is(notNullValue()));
	}

}
