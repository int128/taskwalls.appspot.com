package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.service.TasklistExtensionService;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.Tasks.Tasklists.Patch;
import com.google.api.services.tasks.model.TaskList;
import com.google.api.services.tasks.model.TaskLists;

/**
 * Represents aggregation of task lists.
 * 
 * @author hidetake.org
 */
public class TasklistsController extends ControllerBase {

	public GenericJson get() throws Exception {
		TaskLists taskLists = tasksService.tasklists().list().execute();
		TasklistExtensionService.extend(taskLists);
		return taskLists;
	}

	public GenericJson post() throws Exception {
		if (!AjaxPreconditions.hasJsonContent(request)) {
			return preconditionFailed("request body should be JSON");
		}
		TaskList taskList = parseJsonAs(TaskList.class);
		TaskList created = tasksService.tasklists().insert(taskList).execute();
		return created;
	}

	@Override
	public GenericJson put() throws Exception {
		TaskList taskList = parseJsonAs(TaskList.class);
		String id = taskList.get("id").toString();

		Patch patch = tasksService.tasklists().patch(id, taskList);
		TaskList patched = patch.execute();
		TasklistExtensionService.extend(patched);
		return patched;
	}

	@Override
	public GenericJson delete() throws Exception {
		if (!validateDelete()) {
			return preconditionFailed(errors.toString());
		}
		tasksService.tasklists().delete(asString("id")).execute();
		return null;
	}

	private boolean validateDelete() {
		Validators v = new Validators(request);
		v.add("id", v.required());
		return v.validate();
	}

}
