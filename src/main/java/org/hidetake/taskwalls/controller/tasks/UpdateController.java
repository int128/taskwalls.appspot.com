package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.client.util.Data;
import com.google.api.client.util.DateTime;
import com.google.api.services.tasks.Tasks.TasksOperations.Patch;
import com.google.api.services.tasks.model.Task;

public class UpdateController extends ControllerBase {

	@Override
	protected boolean validate() {
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		v.add("id", v.required());
		v.add("title");
		v.add("notes");
		v.add("due", v.longType());
		v.add("status", v.regexp("completed|needsAction"));
		return v.validate();
	}

	@Override
	public GenericJson response() throws Exception {
		Task task = new Task();
		task.setId(asString("id"));

		// optional parameters (may be null)
		task.setTitle(asString("title"));
		task.setNotes(asString("notes"));
		if (asLong("due") == null) {
			// leave as null
		}
		else if (asLong("due") == 0L) {
			task.setDue(Data.NULL_DATE_TIME);
		}
		else {
			task.setDue(new DateTime(asLong("due"), 0));
		}
		task.setStatus(asString("status"));
		if ("needsAction".equals(asString("status"))) {
			task.setCompleted(Data.NULL_DATE_TIME);
		}

		Patch patch = tasksService.tasks().patch(asString("tasklistID"), task.getId(), task);
		Task patched = patch.execute();
		return patched;
	}

}
