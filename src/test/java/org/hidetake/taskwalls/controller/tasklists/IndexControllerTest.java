package org.hidetake.taskwalls.controller.tasklists;

import static org.hamcrest.CoreMatchers.*;
import static org.hidetake.taskwalls.controller.RequestTestUtil.*;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import java.io.InputStreamReader;
import java.util.Arrays;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.hidetake.taskwalls.controller.MockTasksServiceFactory;
import org.hidetake.taskwalls.meta.TasklistExtensionMeta;
import org.hidetake.taskwalls.model.TasklistExtension;
import org.hidetake.taskwalls.util.googleapi.TasksServiceFactoryLocator;
import org.junit.Test;
import org.mockito.Matchers;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.slim3.datastore.Datastore;
import org.slim3.tester.ControllerTestCase;

import com.google.api.services.tasks.Tasks;
import com.google.api.services.tasks.Tasks.Tasklists;
import com.google.api.services.tasks.Tasks.Tasklists.Insert;
import com.google.api.services.tasks.Tasks.Tasklists.List;
import com.google.api.services.tasks.model.TaskList;
import com.google.api.services.tasks.model.TaskLists;

public class IndexControllerTest extends ControllerTestCase {

	@Test
	public void get() throws Exception {
		TasklistExtension extension1 = new TasklistExtension();
		extension1.setKey(TasklistExtension.createKey("TASKLIST1"));
		extension1.setColorCode(15);
		Datastore.put(extension1);

		TaskList taskList1 = new TaskList();
		taskList1.setId("TASKLIST1");
		TaskLists taskLists = new TaskLists();
		taskLists.setItems(Arrays.asList(taskList1));
		List listApi = mock(List.class);
		when(listApi.execute()).thenReturn(taskLists);
		Tasklists tasklistsApi = mock(Tasklists.class);
		when(tasklistsApi.list()).thenReturn(listApi);
		Tasks tasksApi = mock(Tasks.class);
		when(tasksApi.tasklists()).thenReturn(tasklistsApi);

		enableSession(tester);
		setXHR(tester);
		TasksServiceFactoryLocator.set(new MockTasksServiceFactory(tasksApi));
		tester.start("/tasklists/");
		IndexController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(tester.response.getContentType(), is("application/json"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
		verify(listApi).execute();

		TasklistExtension actual1 = Datastore.get(TasklistExtensionMeta.get(),
				TasklistExtension.createKey("TASKLIST1"));
		assertThat(actual1.getColorCode(), is(15));
	}

	@Test
	public void post() throws Exception {
		final Insert insertApi = mock(Insert.class);
		when(insertApi.execute()).thenReturn(new TaskList());
		Tasklists tasklistsApi = mock(Tasklists.class);
		when(tasklistsApi.insert(Matchers.any(TaskList.class)))
				.then(new Answer<Insert>() {
					@Override
					public Insert answer(InvocationOnMock invocation) throws Throwable {
						TaskList task = (TaskList) invocation.getArguments()[0];
						assertThat(task.getTitle(), is("hogehoge"));
						return insertApi;
					}
				});
		Tasks tasksApi = mock(Tasks.class);
		when(tasksApi.tasklists()).thenReturn(tasklistsApi);

		String json = "{\"title\":\"hogehoge\"}";

		enableSession(tester);
		setMethodAsPost(tester);
		setXHR(tester);
		TasksServiceFactoryLocator.set(new MockTasksServiceFactory(tasksApi));
		tester.request.setCharacterEncoding("UTF-8");
		tester.request.setContentType("application/json; Charset=UTF-8");
		tester.request.setReader(IOUtils.toBufferedReader(
				new InputStreamReader(IOUtils.toInputStream(json))));
		tester.start("/tasklists/");
		IndexController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(tester.response.getContentType(), is("application/json"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
		verify(insertApi).execute();
	}

}
