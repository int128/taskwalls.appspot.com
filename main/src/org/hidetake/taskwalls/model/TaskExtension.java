package org.hidetake.taskwalls.model;

import com.google.api.client.util.DateTime;
import com.google.api.services.tasks.model.Task;
import com.google.api.services.tasks.model.Tasks;

public class TaskExtension
{

	/**
	 * Extends properties of {@link Task}.
	 * <ul>
	 * <li>dueTime</li>
	 * <li>tasklistID</li>
	 * </ul>
	 * @param task
	 * @return same instance as argument
	 */
	public static Task extend(Task task)
	{
		DateTime due = task.getDue();
		if (due != null) {
			task.put("dueTime", due.getValue());
		}

		String[] uriParts = task.getSelfLink().split("/");
		if (uriParts.length > 3) {
			task.put("tasklistID", uriParts[uriParts.length - 3]);
		}

		return task;
	}

	/**
	 * Applies {@link #extend(Task)} for each items.
	 * @param tasks
	 * @return same instance as argument
	 */
	public static Tasks extend(Tasks tasks)
	{
		if (tasks.getItems() != null) {
			for (Task task : tasks.getItems()) {
				extend(task);
			}
		}
		return tasks;
	}

}
