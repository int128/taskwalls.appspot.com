package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.TaskList;

public class CreateController extends ControllerBase {

	@Override
	public GenericJson response() throws Exception {
		TaskList taskList = parseJsonAs(TaskList.class);
		TaskList created = tasksService.tasklists().insert(taskList).execute();
		return created;
	}

}
