package org.hidetake.taskwalls.controller;

import org.slim3.controller.router.RouterImpl;

public class AppRouter extends RouterImpl {

	public AppRouter() {
		// aggregate of task lists

		// the task list
		addRouting("/tasklists/{tasklistID}",
				"/tasklists/tasklist?tasklistID={tasklistID}");

		// extension of the task list
		addRouting("/tasklists/{tasklistID}/extension",
				"/tasklists/extension?tasklistID={tasklistID}");

		// aggregate of tasks
		addRouting("/tasklists/{tasklistID}/tasks/",
				"/tasks/?tasklistID={tasklistID}");

		// the task
		addRouting("/tasklists/{tasklistID}/tasks/{id}",
				"/tasks/task?tasklistID={tasklistID}&id={id}");
		addRouting("/tasklists/{tasklistID}/tasks/{id}/move",
				"/tasks/move?tasklistID={tasklistID}&id={id}");
	}

}
