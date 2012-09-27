package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.Tasks.TasksOperations.Patch;
import com.google.api.services.tasks.model.Task;

/**
 * Represents the task.
 * 
 * @author hidetake.org
 */
public class TaskController extends ControllerBase {

	@Override
	public GenericJson put() throws Exception {
		Task task = parseJsonAs(Task.class);
		Patch patch = tasksService.tasks().patch(param("tasklistID"), param("id"), task);
		Task patched = patch.execute();
		return patched;
	}

	@Override
	public GenericJson delete() throws Exception {
		tasksService.tasks().delete(param("tasklistID"), param("id")).execute();
		return null;
	}

}
