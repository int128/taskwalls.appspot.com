package org.hidetake.taskwalls.service;

import org.hidetake.taskwalls.model.TasklistExtension;
import org.junit.Test;
import org.slim3.datastore.Datastore;
import org.slim3.tester.AppEngineTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

/**
 * Test for {@link TasklistExtensionService}.
 * @author hidetake.org
 */
public class TasklistExtensionServiceTest extends AppEngineTestCase {

	@Test
	public void test_put_and_get() throws Exception {
		TasklistExtension tasklistExtension = new TasklistExtension();
		tasklistExtension.setKey(TasklistExtension.createKey("hogeKey"));
		tasklistExtension.setColorCode(3);
		TasklistExtensionService.put(tasklistExtension);

		TasklistExtension actual = Datastore.get(TasklistExtension.class,
				TasklistExtension.createKey("hogeKey"));
		assertThat(actual.getColorCode(), is(3));
	}

}
