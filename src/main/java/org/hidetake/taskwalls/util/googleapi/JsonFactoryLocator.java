package org.hidetake.taskwalls.util.googleapi;

import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson.JacksonFactory;

/**
 * Singleton for {@link JsonFactory}.
 * 
 * @author hidetake.org
 */
public class JsonFactoryLocator {

	private static JsonFactory singleton;

	private JsonFactoryLocator() {
	}

	public static JsonFactory get() {
		if (singleton == null) {
			singleton = new JacksonFactory();
		}
		return singleton;
	}

}
