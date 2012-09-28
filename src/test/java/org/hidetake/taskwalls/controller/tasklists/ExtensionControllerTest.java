package org.hidetake.taskwalls.controller.tasklists;

import static org.hamcrest.CoreMatchers.*;
import static org.hidetake.taskwalls.controller.RequestTestUtil.*;
import static org.junit.Assert.*;

import javax.servlet.http.HttpServletResponse;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.controller.tasklists.ExtensionController;
import org.hidetake.taskwalls.meta.TasklistExtensionMeta;
import org.hidetake.taskwalls.model.TasklistExtension;
import org.junit.Test;
import org.slim3.datastore.Datastore;
import org.slim3.tester.ControllerTestCase;

public class ExtensionControllerTest extends ControllerTestCase {

	@Test
	public void notXHR() throws Exception {
		enableSession(tester);
		setMethodAsPut(tester);
		tester.start("/tasklists/TASKLISTID/extension");
		ExtensionController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void badParameter() throws Exception {
		enableSession(tester);
		setMethodAsPut(tester);
		setXHR(tester);
		tester.start("/tasklists/TASKLISTID/extension");
		ExtensionController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void test_put() throws Exception {
		enableSession(tester);
		setMethodAsPut(tester);
		setXHR(tester);
		TasklistExtensionMeta m = TasklistExtensionMeta.get();
		tester.param(m.colorCode, "5");
		tester.start("/tasklists/TASKLISTID/extension");
		ExtensionController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		TasklistExtension actual = Datastore.get(m, TasklistExtension.createKey("TASKLISTID"));
		assertThat(actual.getColorCode(), is(5));
	}

}
