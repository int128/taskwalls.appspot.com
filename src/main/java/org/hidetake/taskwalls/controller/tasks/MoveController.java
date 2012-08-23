package org.hidetake.taskwalls.controller.tasks;

import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.Task;

/**
 * Move the task to another tasklist.
 * 
 * @author hidetake.org
 */
public class MoveController extends ControllerBase {

	private static final Logger logger = Logger.getLogger(MoveController.class.getName());

	@Override
	protected boolean validate() {
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		v.add("id", v.required());
		v.add("destinationTasklistID", v.required());
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

		Task original = tasksService.tasks().get(asString("tasklistID"), asString("id")).execute();
		Task task = new Task();
		task.setCompleted(original.getCompleted());
		task.setDeleted(original.getDeleted());
		task.setDue(original.getDue());
		task.setHidden(original.getHidden());
		task.setNotes(original.getNotes());
		task.setParent(original.getParent());
		task.setPosition(original.getPosition());
		task.setStatus(original.getStatus());
		task.setTitle(original.getTitle());
		task.setUpdated(original.getUpdated());
		// TODO: transaction
		Task moved = tasksService.tasks().insert(asString("destinationTasklistID"), task).execute();
		tasksService.tasks().delete(asString("tasklistID"), asString("id")).execute();
		return moved;
	}

}
