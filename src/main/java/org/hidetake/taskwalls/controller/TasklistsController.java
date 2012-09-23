package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.service.TasklistExtensionService;
import org.hidetake.taskwalls.util.AjaxPreconditions;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.TaskList;
import com.google.api.services.tasks.model.TaskLists;

/**
 * Get task lists.
 * 
 * @author hidetake.org
 */
public class TasklistsController extends ControllerBase {

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

}
