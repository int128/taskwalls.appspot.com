package org.hidetake.taskwalls.service;

import org.hidetake.taskwalls.meta.TaskExtensionMeta;
import org.hidetake.taskwalls.model.TaskExtension;
import org.slim3.datastore.Datastore;

import com.google.api.services.tasks.model.Task;
import com.google.api.services.tasks.model.Tasks;

/**
 * Service class for {@link TaskExtension}.
 * 
 * @author hidetake.org
 */
public class TaskExtensionService {

	/**
	 * Gets the {@link TaskExtension}.
	 * 
	 * @param taskId
	 *            task ID
	 * @return entity or null if not exists
	 */
	public static TaskExtension get(String taskId) {
		TaskExtensionMeta m = TaskExtensionMeta.get();
		return Datastore.getOrNull(m, TaskExtension.createKey(taskId));
	}

	/**
	 * Puts the {@link TaskExtension} to datastore.
	 * 
	 * @param taskExtension
	 *            entity
	 */
	public static void put(TaskExtension taskExtension) {
		Datastore.put(taskExtension);
	}

	/**
	 * Merge {@link TaskExtension} into {@link Task}.
	 * 
	 * @param task
	 *            entity of Tasks API
	 * @return same instance as argument
	 */
	public static Task extend(Task task) {
		TaskExtension taskExtension = get(task.getId());
		if (taskExtension != null) {
			TaskExtensionMeta m = TaskExtensionMeta.get();
			task.put(m.repeat.getName(), taskExtension.getRepeat());
		}
		return task;
	}

	/**
	 * Apply {@link #extend(Task)} to tasks.
	 * 
	 * @param tasks
	 * @return
	 */
	public static Tasks extend(Tasks tasks) {
		for (Task task : tasks.getItems()) {
			extend(task);
		}
		return tasks;
	}

}
