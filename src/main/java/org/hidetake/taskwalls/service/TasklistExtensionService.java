package org.hidetake.taskwalls.service;

import org.hidetake.taskwalls.meta.TasklistExtensionMeta;
import org.hidetake.taskwalls.model.TasklistExtension;
import org.slim3.datastore.Datastore;

import com.google.api.services.tasks.model.TaskList;
import com.google.api.services.tasks.model.TaskLists;

/**
 * Service for {@link TasklistExtension}.
 * 
 * @author hidetake.org
 */
public class TasklistExtensionService {

	/**
	 * Puts the {@link TasklistExtension} to datastore.
	 * 
	 * @param tasklistExtension
	 *            the model
	 */
	public static void put(TasklistExtension tasklistExtension) {
		Datastore.put(tasklistExtension);
	}

	/**
	 * Gets the {@link TasklistExtension}.
	 * 
	 * @param id
	 *            tasklist ID
	 * @return the model or null if not exists
	 */
	public static TasklistExtension get(String id) {
		TasklistExtensionMeta m = TasklistExtensionMeta.get();
		return Datastore.getOrNull(m, TasklistExtension.createKey(id));
	}

	/**
	 * Merge {@link TasklistExtension} to the {@link TaskList}.
	 * 
	 * @param taskList
	 * @return
	 */
	public static TaskList extend(TaskList taskList) {
		TasklistExtension tasklistExtension = get(taskList.getId());
		if (tasklistExtension != null) {
			TasklistExtensionMeta m = TasklistExtensionMeta.get();
			taskList.put(m.colorCode.getName(), tasklistExtension.getColorCode());
		}
		return taskList;
	}

	/**
	 * Merge {@link TasklistExtension} to each task list in the {@link TaskLists}.
	 * 
	 * @param taskLists
	 * @return
	 */
	public static TaskLists extend(TaskLists taskLists) {
		for (TaskList taskList : taskLists.getItems()) {
			extend(taskList);
		}
		return taskLists;
	}

}
