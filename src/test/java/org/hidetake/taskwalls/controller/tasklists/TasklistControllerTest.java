package org.hidetake.taskwalls.controller.tasklists;

import static org.hamcrest.CoreMatchers.*;
import static org.hidetake.taskwalls.controller.RequestTestUtil.*;
import static org.junit.Assert.*;
import static org.mockito.Matchers.*;
import static org.mockito.Mockito.*;

import java.io.InputStreamReader;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.hidetake.taskwalls.controller.MockTasksServiceFactory;
import org.hidetake.taskwalls.util.googleapi.TasksServiceFactoryLocator;
import org.junit.Test;
import org.mockito.Matchers;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.slim3.tester.ControllerTestCase;

import com.google.api.services.tasks.Tasks;
import com.google.api.services.tasks.Tasks.Tasklists;
import com.google.api.services.tasks.Tasks.Tasklists.Patch;
import com.google.api.services.tasks.model.TaskList;

public class TasklistControllerTest extends ControllerTestCase {

	@Test
	public void put() throws Exception {
		TaskList tasklist1 = new TaskList();
		tasklist1.setId("TASKLIST1");
		tasklist1.setTitle("hogehoge");
		final Patch patchApi = mock(Patch.class);
		when(patchApi.execute()).thenReturn(tasklist1);
		Tasklists tasklistsApi = mock(Tasklists.class);
		when(tasklistsApi.patch(eq("TASKLIST1"), Matchers.any(TaskList.class)))
				.then(new Answer<Patch>() {
					@Override
					public Patch answer(InvocationOnMock invocation) throws Throwable {
						TaskList task = (TaskList) invocation.getArguments()[1];
						assertThat(task.getTitle(), is("hogehoge"));
						return patchApi;
					}
				});
		Tasks tasksApi = mock(Tasks.class);
		when(tasksApi.tasklists()).thenReturn(tasklistsApi);

		String json = "{\"title\":\"hogehoge\"}";

		enableSession(tester);
		setMethodAsPut(tester);
		setXHR(tester);
		TasksServiceFactoryLocator.set(new MockTasksServiceFactory(tasksApi));
		tester.request.setCharacterEncoding("UTF-8");
		tester.request.setContentType("application/json; Charset=UTF-8");
		tester.request.setReader(IOUtils.toBufferedReader(
				new InputStreamReader(IOUtils.toInputStream(json))));
		tester.start("/tasklists/TASKLIST1");
		TasklistController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(tester.response.getContentType(), is("application/json"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
		verify(patchApi).execute();
	}

	@Test
	public void delete() throws Exception {
		// TODO
	}

}
