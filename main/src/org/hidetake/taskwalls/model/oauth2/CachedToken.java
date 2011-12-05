package org.hidetake.taskwalls.model.oauth2;

import java.io.Serializable;
import java.util.Date;

/**
 * A cached token.
 * 
 * @author hidetake.org
 */
public class CachedToken implements Serializable
{

	private static final long serialVersionUID = 2L;

	private final String accessToken;
	private final String refreshToken;
	private final Date expire;

	/**
	 * Constructor.
	 * @param accessToken access token
	 * @param refreshToken refresh token
	 * @param expire expires date
	 */
	public CachedToken(String accessToken, String refreshToken, Date expire)
	{
		if (accessToken == null) {
			throw new NullPointerException("accessToken is null");
		}
		if (refreshToken == null) {
			throw new NullPointerException("refreshToken is null");
		}
		if (expire == null) {
			throw new NullPointerException("expire is null");
		}
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
		this.expire = expire;
	}

	public String getAccessToken()
	{
		return accessToken;
	}

	public String getRefreshToken()
	{
		return refreshToken;
	}

	public Date getExpire()
	{
		return expire;
	}

}