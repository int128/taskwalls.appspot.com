package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.Task;
import com.google.api.services.tasks.model.Tasks;

/**
 * Represents aggregate of tasks.
 * 
 * @author hidetake.org
 */
public class IndexController extends ControllerBase {

	@Override
	public GenericJson get() throws Exception {
		Tasks tasks = tasksService.tasks().list(param("tasklistID")).execute();
		return tasks;
	}

	@Override
	public GenericJson post() throws Exception {
		if (!AjaxPreconditions.hasJsonContent(request)) {
			return preconditionFailed("request body should be JSON");
		}
		Task task = parseJsonAs(Task.class);
		Task created = tasksService.tasks().insert(param("tasklistID"), task).execute();
		return created;
	}

}
