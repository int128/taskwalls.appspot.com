package org.hidetake.taskwalls.util.googleapis;

import com.google.api.client.json.jackson.JacksonFactory;

/**
 * Singleton class for {@link JacksonFactory}.
 * Instance will be lazy initialized.
 * 
 * @author hidetake.org
 */
public class JacksonFactoryLocator {

	private static JacksonFactory singleton;

	private JacksonFactoryLocator() {
	}

	public static JacksonFactory get() {
		if (singleton == null) {
			singleton = new JacksonFactory();
		}

		return singleton;
	}

}
