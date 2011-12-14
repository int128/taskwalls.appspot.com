package org.hidetake.taskwalls.model;

import java.io.Serializable;

import org.hidetake.taskwalls.model.oauth2.CachedToken;
import org.slim3.datastore.Attribute;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.Model;

import com.google.appengine.api.datastore.Key;

@Model(schemaVersion = 2)
public class Session implements Serializable {

	private static final long serialVersionUID = 2L;

	/**
	 * Create the key.
	 * 
	 * @param sessionID
	 * @return the key
	 */
	public static Key createKey(String sessionID) {
		return Datastore.createKey(Session.class, sessionID);
	}

	@Attribute(primaryKey = true)
	private Key key;

	@Attribute(lob = true)
	private CachedToken token;

	private boolean refreshable;

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

	public CachedToken getToken() {
		return token;
	}

	public void setToken(CachedToken token) {
		this.token = token;
		this.setRefreshable(token.getRefreshToken() != null);
	}

	public boolean isRefreshable() {
		return refreshable;
	}

	/**
	 * @deprecated
	 * @param refreshable
	 */
	public void setRefreshable(boolean refreshable) {
		this.refreshable = refreshable;
	}

}
