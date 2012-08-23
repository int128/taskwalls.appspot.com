package org.hidetake.taskwalls.controller.tasklists;

import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;

public class DeleteController extends ControllerBase {

	private static final Logger logger = Logger.getLogger(DeleteController.class.getName());

	@Override
	protected boolean validate() {
		Validators v = new Validators(request);
		v.add("id", v.required());
		return v.validate();
	}

	@Override
	public GenericJson response() throws Exception {
		if (!isPost()) {
			logger.warning("Precondition failed: not POST");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}
		if (!AjaxPreconditions.isXHR(request)) {
			logger.warning("Precondition failed: not XHR");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}

		tasksService.tasklists().delete(asString("id")).execute();
		return null;
	}

}
