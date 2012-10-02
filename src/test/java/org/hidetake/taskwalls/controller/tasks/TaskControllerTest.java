package org.hidetake.taskwalls.controller.tasks;

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
import com.google.api.services.tasks.Tasks.TasksOperations;
import com.google.api.services.tasks.Tasks.TasksOperations.Delete;
import com.google.api.services.tasks.Tasks.TasksOperations.Patch;
import com.google.api.services.tasks.model.Task;

public class TaskControllerTest extends ControllerTestCase {

	@Test
	public void put() throws Exception {
		final Tasks tasks = mock(Tasks.class);
		final TasksOperations tasksOperations = mock(TasksOperations.class);
		when(tasks.tasks()).thenReturn(tasksOperations);

		final Patch patch = mock(Patch.class);
		when(patch.execute()).thenReturn(new Task());
		when(tasksOperations.patch(eq("TASKLISTID"), eq("TASKID"), Matchers.any(Task.class)))
				.then(new Answer<Patch>() {
					@Override
					public Patch answer(InvocationOnMock invocation) throws Throwable {
						Task task = (Task) invocation.getArguments()[2];
						assertThat(task.getTitle(), is("hogehoge"));
						return patch;
					}
				});

		String json = "{\"title\":\"hogehoge\"}";

		enableSession(tester);
		setXHR(tester);
		setMethodAsPut(tester);
		TasksServiceFactoryLocator.set(new MockTasksServiceFactory(tasks));
		tester.request.setCharacterEncoding("UTF-8");
		tester.request.setContentType("application/json; Charset=UTF-8");
		tester.request.setReader(IOUtils.toBufferedReader(
				new InputStreamReader(IOUtils.toInputStream(json))));
		tester.start("/tasklists/TASKLISTID/tasks/TASKID");
		TaskController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(tester.response.getContentType(), is("application/json"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
		verify(patch).execute();
	}

	@Test
	public void delete() throws Exception {
		final Delete delete = mock(Delete.class);
		final TasksOperations tasksOperations = mock(TasksOperations.class);
		when(tasksOperations.delete(eq("TASKLISTID"), eq("TASKID"))).thenReturn(delete);
		final Tasks tasks = mock(Tasks.class);
		when(tasks.tasks()).thenReturn(tasksOperations);

		enableSession(tester);
		setXHR(tester);
		setMethodAsDelete(tester);
		TasksServiceFactoryLocator.set(new MockTasksServiceFactory(tasks));
		tester.start("/tasklists/TASKLISTID/tasks/TASKID");
		TaskController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		verify(delete).execute();
	}

}
