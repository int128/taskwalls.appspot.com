package org.hidetake.taskwalls.model;

import java.io.Serializable;

import com.google.appengine.api.datastore.Key;

import org.hidetake.taskwalls.service.oauth2.CachedToken;
import org.slim3.datastore.Attribute;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.Model;

@Model(schemaVersion = 1)
public class Session implements Serializable
{

	private static final long serialVersionUID = 1L;

	/**
	 * Create the key.
	 * @param sessionID
	 * @return the key
	 */
	public static Key createKey(String sessionID)
	{
		return Datastore.createKey(Session.class, sessionID);
	}

	@Attribute(primaryKey = true)
	private Key key;

	@Attribute(lob = true)
	private CachedToken token;

	/**
	 * Returns the key.
	 * 
	 * @return the key
	 */
	public Key getKey()
	{
		return key;
	}

	/**
	 * Sets the key.
	 * 
	 * @param key
	 *        the key
	 */
	public void setKey(Key key)
	{
		this.key = key;
	}

	public CachedToken getToken()
	{
		return token;
	}

	public void setToken(CachedToken token)
	{
		this.token = token;
	}

}
