package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.service.TasklistExtensionService;

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
	public GenericJson execute() throws Exception {
		TaskList taskList = parseJsonAs(TaskList.class);
		String id = taskList.get("id").toString();

		Patch patch = tasksService.tasklists().patch(id, taskList);
		TaskList patched = patch.execute();
		TasklistExtensionService.extend(patched);
		return patched;
	}

}
