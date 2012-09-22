package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.Tasks.TasksOperations.Patch;
import com.google.api.services.tasks.model.Task;

public class UpdateController extends ControllerBase {

	@Override
	public GenericJson execute() throws Exception {
		Task task = parseJsonAs(Task.class);
		String tasklistID = task.get("tasklistID").toString();

		Patch patch = tasksService.tasks().patch(tasklistID, task.getId(), task);
		Task patched = patch.execute();
		return patched;
	}

}
