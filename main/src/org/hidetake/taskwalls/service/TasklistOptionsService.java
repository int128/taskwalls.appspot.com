package org.hidetake.taskwalls.service;

import org.hidetake.taskwalls.meta.TasklistOptionsMeta;
import org.hidetake.taskwalls.model.TasklistOptions;
import org.slim3.datastore.Datastore;

/**
 * Service for {@link TasklistOptions}.
 * @author hidetake.org
 */
public class TasklistOptionsService {

	/**
	 * Puts the {@link TasklistOptions} to datastore.
	 * @param tasklistOptions the model
	 */
	public static void put(TasklistOptions tasklistOptions) {
		Datastore.put(tasklistOptions);
	}

	/**
	 * Gets the {@link TasklistOptions}.
	 * @param id tasklist ID
	 * @return the model or null if not exists
	 */
	public static TasklistOptions get(String id) {
		if (id == null) {
			throw new NullPointerException("id is null");
		}
		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		return Datastore.getOrNull(m, TasklistOptions.createKey(id));
	}

}
