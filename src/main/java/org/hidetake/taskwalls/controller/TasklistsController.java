package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.service.TasklistExtensionService;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.TaskLists;

/**
 * Get task lists.
 * 
 * @author hidetake.org
 */
public class TasklistsController extends ControllerBase {

	@Override
	public GenericJson execute() throws Exception {
		TaskLists taskLists = tasksService.tasklists().list().execute();
		TasklistExtensionService.extend(taskLists);
		return taskLists;
	}

}
