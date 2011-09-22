package org.hidetake.taskwalls.controller.tasklists.options;

import org.hidetake.taskwalls.controller.SessionUtil;
import org.hidetake.taskwalls.meta.TasklistOptionsMeta;
import org.hidetake.taskwalls.model.TasklistOptions;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.junit.Test;
import org.slim3.datastore.Datastore;
import org.slim3.tester.ControllerTestCase;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class UpdateControllerTest extends ControllerTestCase
{

	@Test
	public void noSession() throws Exception
	{
		tester.start("/tasklists/options/update");
		UpdateController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is("/errors/noSession"));
	}

	@Test
	public void validationFailed() throws Exception
	{
		SessionUtil.enable(tester);
		tester.start("/tasklists/options/update");
		UpdateController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is("/errors/preconditionFailed"));
	}

	@Test
	public void valid() throws Exception
	{
		SessionUtil.enable(tester);
		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		tester.param("id", "hogeId");
		tester.param(m.colorID, "5");
		tester.request.setMethod("POST");
		tester.request.setHeader(AjaxPreconditions.XHR_HEADER_NAME,
				AjaxPreconditions.XHR_HEADER_VALUE);
		tester.start("/tasklists/options/update");
		UpdateController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		TasklistOptions actual = Datastore.get(m, TasklistOptions.createKey("hogeId"));
		assertThat(actual.getColorID(), is(5));
	}

}
