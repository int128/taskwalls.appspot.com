package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.service.TasklistOptionsService;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.Tasks.Tasklists.Patch;
import com.google.api.services.tasks.model.TaskList;

/**
 * Updates the tasklist.
 * 
 * @author hidetake.org
 */
public class UpdateController extends ControllerBase {

	@Override
	protected boolean validate() {
		Validators v = new Validators(request);
		v.add("id", v.required());
		v.add("title", v.required());
		return v.validate();
	}

	@Override
	public GenericJson response() throws Exception {
		TaskList taskList = new TaskList();
		taskList.setId(asString("id"));
		taskList.setTitle(asString("title"));
		Patch patch = tasksService.tasklists().patch(asString("id"), taskList);
		TaskList patched = patch.execute();

		TasklistOptionsService.extend(patched);
		return patched;
	}

}
