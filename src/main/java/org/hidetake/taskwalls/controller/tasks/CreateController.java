package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.client.util.Data;
import com.google.api.client.util.DateTime;
import com.google.api.services.tasks.model.Task;

public class CreateController extends ControllerBase {

	@Override
	protected boolean validate() {
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		v.add("title", v.required());
		v.add("notes");
		v.add("due", v.required(), v.longType());
		return v.validate();
	}

	@Override
	protected GenericJson response() throws Exception {
		Task task = new Task();
		task.setTitle(asString("title"));
		task.setNotes(asString("notes"));
		if (asLong("due") == 0L) {
			task.setDue(Data.NULL_DATE_TIME);
		}
		else {
			task.setDue(new DateTime(asLong("due"), 0));
		}

		Task created = tasksService.tasks().insert(asString("tasklistID"), task).execute();
		return created;
	}

}
