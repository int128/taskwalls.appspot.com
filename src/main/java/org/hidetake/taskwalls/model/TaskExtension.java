package org.hidetake.taskwalls.model;

import java.io.Serializable;

import org.hidetake.taskwalls.meta.TaskExtensionMeta;
import org.slim3.datastore.Attribute;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.Model;

import com.google.api.services.tasks.model.Task;
import com.google.appengine.api.datastore.Key;

/**
 * Extension for {@link Task} entity.
 * 
 * @author hidetake.org
 */
@Model(schemaVersion = 1)
public class TaskExtension implements Serializable {

	private static final long serialVersionUID = 1L;

	@Attribute(primaryKey = true)
	private Key key;

	private TaskRepeat repeat;

	public static Key createKey(String taskId) {
		return Datastore.createKey(TaskExtensionMeta.get(), taskId);
	}

	public Key getKey() {
		return key;
	}

	public void setKey(Key key) {
		this.key = key;
	}

	public TaskRepeat getRepeat() {
		return repeat;
	}

	public void setRepeat(TaskRepeat repeat) {
		this.repeat = repeat;
	}

}
