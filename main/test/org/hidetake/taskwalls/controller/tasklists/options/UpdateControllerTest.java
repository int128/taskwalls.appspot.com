package org.hidetake.taskwalls.controller.tasklists.options;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.controller.RequestTestUtil;
import org.hidetake.taskwalls.meta.TasklistOptionsMeta;
import org.hidetake.taskwalls.model.TasklistOptions;
import org.junit.Test;
import org.slim3.datastore.Datastore;
import org.slim3.tester.ControllerTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class UpdateControllerTest extends ControllerTestCase {

	@Test
	public void xhr() throws Exception {
		RequestTestUtil.enableSession(tester);
		RequestTestUtil.setMethodAsPost(tester);
		tester.start("/tasklists/options/update");
		UpdateController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void preconditionFailed() throws Exception {
		RequestTestUtil.enableSession(tester);
		RequestTestUtil.setMethodAsPost(tester);
		RequestTestUtil.setXHR(tester);
		tester.start("/tasklists/options/update");
		UpdateController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void valid() throws Exception {
		RequestTestUtil.enableSession(tester);
		RequestTestUtil.setMethodAsPost(tester);
		RequestTestUtil.setXHR(tester);
		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		tester.param("id", "hogeId");
		tester.param(m.colorID, "5");
		tester.start("/tasklists/options/update");
		UpdateController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		TasklistOptions actual = Datastore.get(m, TasklistOptions.createKey("hogeId"));
		assertThat(actual.getColorID(), is(5));
	}

}
