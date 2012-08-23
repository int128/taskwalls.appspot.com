package org.hidetake.taskwalls.controller.tasklists.options;

import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.meta.TasklistOptionsMeta;
import org.hidetake.taskwalls.model.TasklistOptions;
import org.hidetake.taskwalls.service.TasklistOptionsService;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;

/**
 * Updates the tasklist options.
 * 
 * @author hidetake.org
 */
public class UpdateController extends ControllerBase {

	private static final Logger logger = Logger.getLogger(UpdateController.class.getName());

	@Override
	protected boolean validate() {
		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		Validators v = new Validators(request);
		v.add("id", v.required());
		v.add(m.colorCode, v.required(), v.integerType());
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

		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		TasklistOptions tasklistOptions = new TasklistOptions();
		tasklistOptions.setKey(TasklistOptions.createKey(asString("id")));
		tasklistOptions.setColorCode(asInteger(m.colorCode));
		TasklistOptionsService.put(tasklistOptions);
		return null;
	}

}
