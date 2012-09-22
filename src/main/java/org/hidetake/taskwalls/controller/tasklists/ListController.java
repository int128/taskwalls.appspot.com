package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.service.TasklistExtensionService;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.TaskLists;

/**
 * Get tasklists.
 * 
 * @author hidetake.org
 */
public class ListController extends ControllerBase {

	@Override
	public GenericJson response() throws Exception {
		TaskLists taskLists = tasksService.tasklists().list().execute();
		TasklistExtensionService.extend(taskLists);
		return taskLists;
	}

}
