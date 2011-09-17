package org.hidetake.lab.service.oauth2;

import java.io.Serializable;

/**
 * A cached token.
 * 
 * @author hidetake.org
 */
public class CachedToken implements Serializable
{

	private static final long serialVersionUID = 1L;

	private final String accessToken;
	private final String refreshToken;

	/**
	 * Constructor.
	 * @param accessToken access token
	 * @param refreshToken refresh token
	 */
	public CachedToken(String accessToken, String refreshToken)
	{
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}

	public String getAccessToken()
	{
		return accessToken;
	}

	public String getRefreshToken()
	{
		return refreshToken;
	}

}
