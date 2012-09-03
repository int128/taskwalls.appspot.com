package org.hidetake.taskwalls.util.googleapis;

import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;

/**
 * Singleton for {@link HttpTransport}.
 * 
 * @author hidetake.org
 */
public class HttpTransportLocator {

	private static HttpTransport singleton;

	private HttpTransportLocator() {
	}

	public static HttpTransport get() {
		if (singleton == null) {
			singleton = new NetHttpTransport();
		}
		return singleton;
	}

}
