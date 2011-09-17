package org.hidetake.taskwalls.service.oauth2;

/**
 * Represents an identifier for OAuth2 clients.
 * 
 * @author hidetake.org
 */
public final class ClientCredential
{

	private final String clientId;
	private final String clientSecret;

	/**
	 * Constructor.
	 * @param clientId
	 * @param clientSecret
	 */
	public ClientCredential(String clientId, String clientSecret)
	{
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	public String getClientId()
	{
		return clientId;
	}

	public String getClientSecret()
	{
		return clientSecret;
	}

}
