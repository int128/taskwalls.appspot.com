package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.Tasks;

/**
 * Get tasks.
 * 
 * @author hidetake.org
 */
public class ListController extends ControllerBase {

	@Override
	public GenericJson execute() throws Exception {
		if (!validate()) {
			return preconditionFailed(errors.toString());
		}
		Tasks tasks = tasksService.tasks().list(param("tasklistID")).execute();
		return tasks;
	}

	private boolean validate() {
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		return v.validate();
	}

}
