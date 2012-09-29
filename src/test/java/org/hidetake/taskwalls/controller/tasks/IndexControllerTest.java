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
import com.google.api.services.tasks.Tasks.TasksOperations.Insert;
import com.google.api.services.tasks.Tasks.TasksOperations.List;
import com.google.api.services.tasks.model.Task;

public class IndexControllerTest extends ControllerTestCase {

	@Test
	public void get() throws Exception {
		final List list = mock(List.class);
		when(list.execute()).thenReturn(new com.google.api.services.tasks.model.Tasks());
		final TasksOperations tasksOperations = mock(TasksOperations.class);
		when(tasksOperations.list("TASKLISTID")).thenReturn(list);
		final Tasks tasks = mock(Tasks.class);
		when(tasks.tasks()).thenReturn(tasksOperations);

		enableSession(tester);
		setXHR(tester);
		TasksServiceFactoryLocator.set(new MockTasksServiceFactory(tasks));
		tester.start("/tasklists/TASKLISTID/tasks/");
		IndexController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(tester.response.getContentType(), is("application/json"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
	}

	@Test
	public void post() throws Exception {
		final Insert insert = mock(Insert.class);
		when(insert.execute()).thenReturn(new Task());
		final TasksOperations tasksOperations = mock(TasksOperations.class);
		when(tasksOperations.insert(eq("TASKLISTID"), Matchers.any(Task.class)))
			.then(new Answer<Insert>() {
				@Override
				public Insert answer(InvocationOnMock invocation) throws Throwable {
					Task task = (Task)invocation.getArguments()[1];
					assertThat(task.getTitle(), is("hogehoge"));
					return insert;
				}
			});
		final Tasks tasks = mock(Tasks.class);
		when(tasks.tasks()).thenReturn(tasksOperations);

		String json = "{\"title\":\"hogehoge\"}";

		enableSession(tester);
		setXHR(tester);
		setMethodAsPost(tester);
		TasksServiceFactoryLocator.set(new MockTasksServiceFactory(tasks));
		tester.request.setCharacterEncoding("UTF-8");
		tester.request.setContentType("application/json; Charset=UTF-8");
		tester.request.setReader(IOUtils.toBufferedReader(
				new InputStreamReader(IOUtils.toInputStream(json))));
		tester.start("/tasklists/TASKLISTID/tasks/");
		IndexController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(tester.response.getContentType(), is("application/json"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
	}

}
