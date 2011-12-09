package org.hidetake.taskwalls.controller.tasklists;

import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

import com.google.api.services.tasks.model.TaskList;

public class CreateController extends ControllerBase
{

	private static final Logger logger = Logger.getLogger(CreateController.class.getName());

	@Override
	public Navigation run() throws Exception
	{
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
		if (!validate()) {
			logger.warning("Precondition failed: " + errors.toString());
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}

		TaskList taskList = new TaskList();
		taskList.setId(asString("id"));
		taskList.setTitle(asString("title"));
		TaskList created = tasksService.tasklists.insert(taskList).execute();
		return jsonResponse(created);
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("title", v.required());
		return v.validate();
	}

}
