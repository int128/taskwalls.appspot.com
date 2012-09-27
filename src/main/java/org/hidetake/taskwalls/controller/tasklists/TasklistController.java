package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.service.TasklistExtensionService;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.Tasks.Tasklists.Patch;
import com.google.api.services.tasks.model.TaskList;

/**
 * Represents the task list.
 * 
 * @author hidetake.org
 */
public class TasklistController extends ControllerBase {

	@Override
	public GenericJson put() throws Exception {
		TaskList taskList = parseJsonAs(TaskList.class);
		Patch patch = tasksService.tasklists().patch(param("tasklistID"), taskList);
		TaskList patched = patch.execute();
		TasklistExtensionService.extend(patched);
		return patched;
	}

	@Override
	public GenericJson delete() throws Exception {
		tasksService.tasklists().delete(param("tasklistID")).execute();
		return null;
	}

}
