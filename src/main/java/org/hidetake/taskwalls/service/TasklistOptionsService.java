package org.hidetake.taskwalls.service;

import org.hidetake.taskwalls.meta.TasklistOptionsMeta;
import org.hidetake.taskwalls.model.TasklistOptions;
import org.slim3.datastore.Datastore;

import com.google.api.services.tasks.model.TaskList;
import com.google.api.services.tasks.model.TaskLists;

/**
 * Service for {@link TasklistOptions}.
 * 
 * @author hidetake.org
 */
public class TasklistOptionsService {

	/**
	 * Puts the {@link TasklistOptions} to datastore.
	 * 
	 * @param tasklistOptions
	 *            the model
	 */
	public static void put(TasklistOptions tasklistOptions) {
		Datastore.put(tasklistOptions);
	}

	/**
	 * Gets the {@link TasklistOptions}.
	 * 
	 * @param id
	 *            tasklist ID
	 * @return the model or null if not exists
	 */
	public static TasklistOptions get(String id) {
		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		return Datastore.getOrNull(m, TasklistOptions.createKey(id));
	}

	/**
	 * Merge {@link TasklistOptions} to the {@link TaskList}.
	 * 
	 * @param taskList
	 * @return
	 */
	public static TaskList extend(TaskList taskList) {
		TasklistOptions tasklistOptions = get(taskList.getId());
		if (tasklistOptions != null) {
			TasklistOptionsMeta m = TasklistOptionsMeta.get();
			taskList.put(m.colorCode.getName(), tasklistOptions.getColorCode());
		}
		return taskList;
	}

	/**
	 * Merge {@link TasklistOptions} to each task list in the {@link TaskLists}.
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
