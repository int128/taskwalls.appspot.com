package org.hidetake.taskwalls.controller.tasks;

import static org.hamcrest.CoreMatchers.*;
import static org.hidetake.taskwalls.controller.RequestTestUtil.*;
import static org.junit.Assert.*;
import static org.mockito.Matchers.*;
import static org.mockito.Mockito.*;

import javax.servlet.http.HttpServletResponse;

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
import com.google.api.services.tasks.Tasks.TasksOperations.Get;
import com.google.api.services.tasks.Tasks.TasksOperations.Insert;
import com.google.api.services.tasks.model.Task;

public class MoveControllerTest extends ControllerTestCase {

	@Test
	public void post() throws Exception {
		Tasks tasks = mock(Tasks.class);
		TasksOperations tasksOperations = mock(TasksOperations.class);
		when(tasks.tasks()).thenReturn(tasksOperations);

		final Get getApi = mock(Get.class);
		Task task1 = new Task();
		task1.setId("TASK1");
		task1.setTitle("hogehoge");
		when(getApi.execute()).thenReturn(task1);
		when(tasksOperations.get(eq("TASKLIST1"), eq("TASK1"))).thenReturn(getApi);

		final Insert insertApi = mock(Insert.class);
		when(insertApi.execute()).thenReturn(new Task());
		when(tasksOperations.insert(eq("TASKLIST2"), Matchers.any(Task.class)))
				.then(new Answer<Insert>() {
					@Override
					public Insert answer(InvocationOnMock invocation) throws Throwable {
						Task task = (Task) invocation.getArguments()[1];
						assertThat(task.getTitle(), is("hogehoge"));
						return insertApi;
					}
				});

		final Delete delete = mock(Delete.class);
		when(tasksOperations.delete(eq("TASKLIST1"), eq("TASK1"))).thenReturn(delete);

		enableSession(tester);
		setXHR(tester);
		setMethodAsPost(tester);
		TasksServiceFactoryLocator.set(new MockTasksServiceFactory(tasks));
		tester.param("to", "TASKLIST2");
		tester.start("/tasklists/TASKLIST1/tasks/TASK1/move");
		MoveController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(tester.response.getContentType(), is("application/json"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
		verify(getApi).execute();
		verify(insertApi).execute();
		verify(delete).execute();
	}

}
