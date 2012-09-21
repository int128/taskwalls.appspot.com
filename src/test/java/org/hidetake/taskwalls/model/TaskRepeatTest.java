package org.hidetake.taskwalls.model;

import static org.junit.Assert.*;

import static org.hamcrest.CoreMatchers.*;

import org.junit.Test;

public class TaskRepeatTest {

	@Test
	public void test_REGEXP_PATTERN() throws Exception {
		assertThat(TaskRepeat.REGEXP_PATTERN, is("ONCE|WEEKLY|MONTHLY|YEARLY"));
	}

}
