package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.Task;
import com.google.api.services.tasks.model.Tasks;

/**
 * Get tasks in the task list.
 * 
 * @author hidetake.org
 */
public class TasksController extends ControllerBase {

	@Override
	public GenericJson execute() throws Exception {
		if (isGet()) {
			return get();
		} else if (isPost()) {
			return post();
		}
		return null;
	}

	public GenericJson get() throws Exception {
		if (!validateGet()) {
			return preconditionFailed(errors.toString());
		}
		Tasks tasks = tasksService.tasks().list(param("tasklistID")).execute();
		return tasks;
	}

	private boolean validateGet() {
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		return v.validate();
	}

	public GenericJson post() throws Exception {
		if (!AjaxPreconditions.hasJsonContent(request)) {
			return preconditionFailed("request body should be JSON");
		}
		Task task = parseJsonAs(Task.class);
		String tasklistID = task.get("tasklistID").toString();

		Task created = tasksService.tasks().insert(tasklistID, task).execute();
		return created;
	}

}
