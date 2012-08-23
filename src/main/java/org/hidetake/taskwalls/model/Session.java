package org.hidetake.taskwalls.model;

import java.util.Date;

/**
 * Represents an OAuth session.
 * 
 * @author hidetake.org
 */
public class Session {

	private String accessToken;
	private String refreshToken;
	private Date expiration;

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
