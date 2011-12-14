package org.hidetake.taskwalls.controller.tasklists;

import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.model.TasklistOptions;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;

import com.google.api.services.tasks.model.TaskLists;

/**
 * Get tasklists.
 * @author hidetake.org
 */
public class ListController extends ControllerBase {

	private static final Logger logger = Logger.getLogger(ListController.class.getName());

	@Override
	public Navigation run() throws Exception {
		if (!isGet()) {
			logger.warning("Precondition failed: not GET");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}
		if (!AjaxPreconditions.isXHR(request)) {
			logger.warning("Precondition failed: not XHR");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}

		TaskLists taskLists = tasksService.tasklists().list().execute();
		TasklistOptions.mergeTo(taskLists);
		return jsonResponse(taskLists);
	}

}
