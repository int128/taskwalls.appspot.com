package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.Tasks.TasksOperations.Patch;
import com.google.api.services.tasks.model.Task;
import com.google.api.services.tasks.model.Tasks;

/**
 * Represents aggregation of task lists.
 * 
 * @author hidetake.org
 */
public class TasksController extends ControllerBase {

	@Override
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

	@Override
	public GenericJson post() throws Exception {
		if (!AjaxPreconditions.hasJsonContent(request)) {
			return preconditionFailed("request body should be JSON");
		}
		Task task = parseJsonAs(Task.class);
		String tasklistID = task.get("tasklistID").toString();

		Task created = tasksService.tasks().insert(tasklistID, task).execute();
		return created;
	}

	@Override
	public GenericJson put() throws Exception {
		Task task = parseJsonAs(Task.class);
		String tasklistID = task.get("tasklistID").toString();

		Patch patch = tasksService.tasks().patch(tasklistID, task.getId(), task);
		Task patched = patch.execute();
		return patched;
	}

	@Override
	public GenericJson delete() throws Exception {
		if (!validateDelete()) {
			return preconditionFailed(errors.toString());
		}
		tasksService.tasks().delete(param("tasklistID"), param("id")).execute();
		return null;
	}

	private boolean validateDelete() {
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		v.add("id", v.required());
		return v.validate();
	}

}
