package org.hidetake.taskwalls.util.googleapis;

import com.google.api.client.extensions.appengine.http.UrlFetchTransport;
import com.google.api.client.http.HttpTransport;

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
			singleton = new UrlFetchTransport();
		}
		return singleton;
	}

}
