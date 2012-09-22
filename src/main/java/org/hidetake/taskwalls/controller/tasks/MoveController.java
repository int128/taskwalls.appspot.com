package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.Task;

/**
 * Move the task to another tasklist.
 * 
 * @author hidetake.org
 */
public class MoveController extends ControllerBase {

	@Override
	public GenericJson execute() throws Exception {
		if (!validate()) {
			return preconditionFailed(errors.toString());
		}

		String id = param("id");
		String tasklistID = param("tasklistID");
		String destinationTasklistID = param("destinationTasklistID");

		Task original = tasksService.tasks().get(tasklistID, id).execute();
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
		Task moved = tasksService.tasks().insert(destinationTasklistID, task).execute();
		tasksService.tasks().delete(tasklistID, id).execute();
		return moved;
	}

	private boolean validate() {
		Validators v = new Validators(request);
		v.add("id", v.required());
		v.add("tasklistID", v.required());
		v.add("destinationTasklistID", v.required());
		return v.validate();
	}

}
