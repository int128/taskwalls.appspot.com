package org.hidetake.taskwalls.service;

import org.hidetake.taskwalls.model.TasklistOptions;
import org.slim3.datastore.Datastore;

/**
 * Service for {@link TasklistOptions}.
 * @author hidetake.org
 */
public class TasklistOptionsService
{

	/**
	 * Puts the {@link TasklistOptions} to datastore.
	 * @param tasklistOptions the model
	 */
	public static void put(TasklistOptions tasklistOptions)
	{
		Datastore.put(tasklistOptions);
	}

}
