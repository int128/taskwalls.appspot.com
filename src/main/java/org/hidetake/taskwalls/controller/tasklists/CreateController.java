package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.TaskList;

public class CreateController extends ControllerBase {

	@Override
	protected boolean validate() {
		Validators v = new Validators(request);
		v.add("title", v.required());
		return v.validate();
	}

	@Override
	public GenericJson response() throws Exception {
		TaskList taskList = new TaskList();
		taskList.setId(asString("id"));
		taskList.setTitle(asString("title"));
		TaskList created = tasksService.tasklists().insert(taskList).execute();
		return created;
	}

}
