package org.hidetake.taskwalls.model;

import java.io.Serializable;
import java.util.Date;

import org.slim3.datastore.Attribute;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.Model;

import com.google.appengine.api.datastore.Key;

@Model(schemaVersion = 3)
public class Session implements Serializable {

	private static final long serialVersionUID = 3L;

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

	private String accessToken;
	private String refreshToken;
	private Date expiration;

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
	 * Get the access token.
	 * 
	 * @return
	 */
	public String getAccessToken() {
		return accessToken;
	}

	/**
	 * Set the access token.
	 * 
	 * @param accessToken
	 */
	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

	/**
	 * Get the refresh token. This may be null.
	 * 
	 * @return
	 */
	public String getRefreshToken() {
		return refreshToken;
	}

	/**
	 * Set the refresh token.
	 * 
	 * @param refreshToken
	 */
	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}

	/**
	 * Get the expiration date.
	 * 
	 * @return
	 */
	public Date getExpiration() {
		return expiration;
	}

	/**
	 * Set the expiration date.
	 * 
	 * @param expire
	 */
	public void setExpiration(Date expire) {
		this.expiration = expire;
	}

	/**
	 * Returns whether the access token has been expired.
	 * 
	 * @return
	 */
	public boolean isExpired() {
		return getExpiration().getTime() < System.currentTimeMillis();
	}

}
