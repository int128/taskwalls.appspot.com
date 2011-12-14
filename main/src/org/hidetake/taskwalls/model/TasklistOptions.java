package org.hidetake.taskwalls.model;

import java.io.Serializable;

import org.hidetake.taskwalls.meta.TasklistOptionsMeta;
import org.hidetake.taskwalls.service.TasklistOptionsService;
import org.slim3.datastore.Attribute;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.Model;

import com.google.api.services.tasks.model.TaskList;
import com.google.api.services.tasks.model.TaskLists;
import com.google.appengine.api.datastore.Key;

/**
 * Tasklist options model.
 * @author hidetake.org
 */
@Model(schemaVersion = 1)
public class TasklistOptions implements Serializable {

	private static final long serialVersionUID = 1L;

	@Attribute(primaryKey = true)
	private Key key;
	private int colorID;

	/**
	 * Merge {@link TasklistOptions} to given {@link TaskList}.
	 * @param taskList
	 * @return
	 */
	public static TaskList mergeTo(TaskList taskList) {
		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		TasklistOptions tasklistOptions = TasklistOptionsService.get(taskList.getId());
		if (tasklistOptions != null) {
			taskList.put(m.colorID.getName(), tasklistOptions.getColorID());
		}
		return taskList;
	}

	/**
	 * Merge {@link TasklistOptions} to given {@link TaskLists}.
	 * @param taskLists
	 * @return
	 */
	public static TaskLists mergeTo(TaskLists taskLists) {
		for (TaskList taskList : taskLists.getItems()) {
			mergeTo(taskList);
		}
		return taskLists;
	}

	public static Key createKey(String id) {
		return Datastore.createKey(TasklistOptionsMeta.get(), id);
	}

	/**
	 * Returns the key.
	 * @return the key
	 */
	public Key getKey() {
		return key;
	}

	/**
	 * Sets the key.
	 * @param key the key
	 */
	public void setKey(Key key) {
		this.key = key;
	}

	/**
	 * Returns the tasklist color ID.
	 * @return
	 */
	public int getColorID() {
		return colorID;
	}

	/**
	 * Sets the tasklist color ID.
	 * @param colorID
	 */
	public void setColorID(int colorID) {
		this.colorID = colorID;
	}

}
