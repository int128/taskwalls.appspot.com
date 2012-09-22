package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;

public class DeleteController extends ControllerBase {

	@Override
	public GenericJson response() throws Exception {
		if (!validate()) {
			return preconditionFailed(errors.toString());
		}
		tasksService.tasks().delete(param("tasklistID"), param("id")).execute();
		return null;
	}

	private boolean validate() {
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		v.add("id", v.required());
		return v.validate();
	}

}
