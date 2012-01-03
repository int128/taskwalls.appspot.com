package org.hidetake.taskwalls.controller.tasks;

import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

import com.google.api.client.util.Data;
import com.google.api.client.util.DateTime;
import com.google.api.services.tasks.Tasks.TasksOperations.Patch;
import com.google.api.services.tasks.model.Task;

public class UpdateController extends ControllerBase {

	private static final Logger logger = Logger.getLogger(UpdateController.class.getName());

	@Override
	public Navigation run() throws Exception {
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

		Task task = new Task();
		task.setId(asString("id"));

		// optional parameters (may be null)
		task.setTitle(asString("title"));
		task.setNotes(asString("notes"));
		if (asLong("dueTime") != null) {
			task.setDue(new DateTime(asLong("dueTime"), 0));
		}
		else {
			task.setDue(Data.NULL_DATE_TIME);
		}
		task.setStatus(asString("status"));
		if ("needsAction".equals(asString("status"))) {
			task.setCompleted(Data.NULL_DATE_TIME);
		}

		Patch patch = tasksService.tasks().patch(asString("tasklistID"), task.getId(), task);
		Task patched = patch.execute();
		return jsonResponse(patched);
	}

	private boolean validate() {
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		v.add("id", v.required());
		v.add("title");
		v.add("notes");
		v.add("dueTime", v.longType());
		v.add("status", v.regexp("completed|needsAction"));
		return v.validate();
	}

}
