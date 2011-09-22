package org.hidetake.taskwalls.model;

import java.io.Serializable;

import org.hidetake.taskwalls.meta.TasklistOptionsMeta;
import org.slim3.datastore.Attribute;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.Model;

import com.google.appengine.api.datastore.Key;

/**
 * Tasklist options model.
 * @author hidetake.org
 */
@Model(schemaVersion = 1)
public class TasklistOptions implements Serializable
{

	private static final long serialVersionUID = 1L;

	@Attribute(primaryKey = true)
	private Key key;
	private int colorID;

	public static Key createKey(String id)
	{
		return Datastore.createKey(TasklistOptionsMeta.get(), id);
	}

	/**
	 * Returns the key.
	 * @return the key
	 */
	public Key getKey()
	{
		return key;
	}

	/**
	 * Sets the key.
	 * @param key the key
	 */
	public void setKey(Key key)
	{
		this.key = key;
	}

	/**
	 * Returns the tasklist color ID.
	 * @return
	 */
	public int getColorID()
	{
		return colorID;
	}

	/**
	 * Sets the tasklist color ID.
	 * @param colorID
	 */
	public void setColorID(int colorID)
	{
		this.colorID = colorID;
	}

}
