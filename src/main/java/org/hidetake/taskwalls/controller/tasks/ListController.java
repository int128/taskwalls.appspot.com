package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.service.TaskExtensionService;
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
	protected boolean validate() {
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		return v.validate();
	}

	@Override
	public GenericJson response() throws Exception {
		String tasklistID = asString("tasklistID");
		Tasks tasks = tasksService.tasks().list(tasklistID).execute();
		TaskExtensionService.extend(tasks);
		return tasks;
	}

}
