package org.hidetake.taskwalls.controller.tasklists.options;

import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.meta.TasklistOptionsMeta;
import org.hidetake.taskwalls.model.TasklistOptions;
import org.hidetake.taskwalls.service.TasklistOptionsService;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

/**
 * Updates the tasklist options.
 * @author hidetake.org
 */
public class UpdateController extends ControllerBase
{

	private static final Logger logger = Logger.getLogger(UpdateController.class.getName());

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

		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		TasklistOptions tasklistOptions = new TasklistOptions();
		tasklistOptions.setKey(TasklistOptions.createKey(asString("id")));
		tasklistOptions.setColorID(asInteger(m.colorID));
		TasklistOptionsService.put(tasklistOptions);
		return null;
	}

	private boolean validate()
	{
		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		Validators v = new Validators(request);
		v.add("id", v.required());
		v.add(m.colorID, v.required(), v.integerType());
		return v.validate();
	}

}
