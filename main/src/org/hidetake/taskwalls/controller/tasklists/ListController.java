package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.model.TasklistOptions;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;

import com.google.api.services.tasks.model.TaskLists;

/**
 * Get tasklists.
 * @author hidetake.org
 */
public class ListController extends ControllerBase
{

	@Override
	public Navigation run() throws Exception
	{
		if (!isGet()) {
			return forward("/errors/preconditionFailed");
		}
		if (!AjaxPreconditions.isXHR(request)) {
			return forward("/errors/preconditionFailed");
		}

		TaskLists taskLists = tasksService.tasklists.list().execute();
		TasklistOptions.mergeTo(taskLists);
		return jsonResponse(taskLists);
	}

}
