package org.hidetake.taskwalls.model;

import java.io.Serializable;

import org.hidetake.taskwalls.meta.TasklistExtensionMeta;
import org.slim3.datastore.Attribute;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.Model;

import com.google.appengine.api.datastore.Key;

/**
 * Extension model for a task list.
 * 
 * @author hidetake.org
 */
@Model(schemaVersion = 1)
public class TasklistExtension implements Serializable {

	private static final long serialVersionUID = 1L;

	@Attribute(primaryKey = true)
	private Key key;
	private Integer colorCode;

	public static Key createKey(String id) {
		return Datastore.createKey(TasklistExtensionMeta.get(), id);
	}

	/**
	 * Returns the key.
	 * 
	 * @return the key
	 */
	public Key getKey() {
		return key;
	}

	/**
	 * Sets the key.
	 * 
	 * @param key
	 *            the key
	 */
	public void setKey(Key key) {
		this.key = key;
	}

	/**
	 * Returns the tasklist color Code.
	 * This may be null.
	 * 
	 * @return
	 */
	public Integer getColorCode() {
		return colorCode;
	}

	/**
	 * Sets the tasklist color Code.
	 * 
	 * @param colorCode
	 */
	public void setColorCode(Integer colorCode) {
		this.colorCode = colorCode;
	}

}
