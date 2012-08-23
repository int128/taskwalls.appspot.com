package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.model.TasklistOptions;

import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.model.TaskLists;

/**
 * Get tasklists.
 * 
 * @author hidetake.org
 */
public class ListController extends ControllerBase {

	@Override
	protected boolean validate() {
		return true;
	}

	@Override
	public GenericJson response() throws Exception {
		TaskLists taskLists = tasksService.tasklists().list().execute();
		TasklistOptions.mergeTo(taskLists);
		return taskLists;
	}

}
