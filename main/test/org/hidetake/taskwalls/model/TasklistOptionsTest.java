package org.hidetake.taskwalls.model;

import org.slim3.tester.AppEngineTestCase;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

public class TasklistOptionsTest extends AppEngineTestCase {

	@Test
	public void createKey() throws Exception {
		assertThat(TasklistOptions.createKey("xxx"), is(notNullValue()));
	}

}
