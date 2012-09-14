package org.hidetake.taskwalls.controller.tasklists.options;

import static org.hamcrest.CoreMatchers.*;
import static org.hidetake.taskwalls.controller.RequestTestUtil.*;
import static org.junit.Assert.*;

import javax.servlet.http.HttpServletResponse;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.meta.TasklistExtensionMeta;
import org.hidetake.taskwalls.model.TasklistExtension;
import org.junit.Test;
import org.slim3.datastore.Datastore;
import org.slim3.tester.ControllerTestCase;

public class UpdateControllerTest extends ControllerTestCase {

	@Test
	public void xhr() throws Exception {
		enableSession(tester);
		setMethodAsPost(tester);
		tester.start("/tasklists/options/update");
		UpdateController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void preconditionFailed() throws Exception {
		enableSession(tester);
		setMethodAsPost(tester);
		setXHR(tester);
		tester.start("/tasklists/options/update");
		UpdateController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void valid() throws Exception {
		enableSession(tester);
		setMethodAsPost(tester);
		setXHR(tester);
		TasklistExtensionMeta m = TasklistExtensionMeta.get();
		tester.param("id", "hogeId");
		tester.param(m.colorCode, "5");
		tester.start("/tasklists/options/update");
		UpdateController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		TasklistExtension actual = Datastore.get(m, TasklistExtension.createKey("hogeId"));
		assertThat(actual.getColorCode(), is(5));
	}

}
