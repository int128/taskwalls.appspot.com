package org.hidetake.taskwalls.controller.tasks;

import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.Tasks;

/**
 * Get tasks.
 * 
 * @author hidetake.org
 */
public class ListController extends ControllerBase {

	private static final Logger logger = Logger.getLogger(ListController.class.getName());

	@Override
	protected boolean validate() {
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		return v.validate();
	}

	@Override
	public GenericJson response() throws Exception {
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

		String tasklistID = asString("tasklistID");
		Tasks tasks = tasksService.tasks().list(tasklistID).execute();
		return tasks;
	}

}
