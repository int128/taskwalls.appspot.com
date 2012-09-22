package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.Task;

public class CreateController extends ControllerBase {

	@Override
	protected GenericJson response() throws Exception {
		if (!AjaxPreconditions.hasJsonContent(request)) {
			return preconditionFailed("request body should be JSON");
		}

		Task task = parseJsonAs(Task.class);
		String tasklistID = task.get("tasklistID").toString();

		Task created = tasksService.tasks().insert(tasklistID, task).execute();
		return created;
	}

}
