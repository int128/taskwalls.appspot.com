package org.hidetake.lab.service.oauth2;

import com.google.api.client.http.javanet.NetHttpTransport;

/**
 * Singleton class for {@link NetHttpTransport}.
 * Instance will be lazy initialized.
 * 
 * @author hidetake.org
 */
public class NetHttpTransportLocator
{

	private static NetHttpTransport singleton;

	private NetHttpTransportLocator()
	{
	}

	public static NetHttpTransport get()
	{
		if (singleton == null) {
			singleton = new NetHttpTransport();
		}

		return singleton;
	}

}
