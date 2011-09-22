package org.hidetake.taskwalls.service;

import org.hidetake.taskwalls.model.TasklistOptions;
import org.junit.Test;
import org.slim3.datastore.Datastore;
import org.slim3.tester.AppEngineTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

/**
 * Test for {@link TasklistOptionsService}.
 * @author hidetake.org
 */
public class TasklistOptionsServiceTest extends AppEngineTestCase
{

	@Test
	public void put() throws Exception
	{
		TasklistOptions tasklistOptions = new TasklistOptions();
		tasklistOptions.setKey(TasklistOptions.createKey("hogeKey"));
		tasklistOptions.setColorID(3);
		TasklistOptionsService.put(tasklistOptions);

		TasklistOptions actual = Datastore.get(TasklistOptions.class,
				TasklistOptions.createKey("hogeKey"));
		assertThat(actual.getColorID(), is(3));
	}

}
