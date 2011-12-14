package org.hidetake.taskwalls.util;

import java.io.IOException;
import java.io.InputStream;
import java.text.MessageFormat;
import java.util.Properties;

public class Messages {

	private final Properties properties = new Properties();

	/**
	 * Instantiate {@link Messages} omitting {@link IOException} check.
	 * @param inputStream XML format properties file
	 * @return instance
	 */
	public static Messages loadXML(InputStream inputStream) {
		try {
			Messages messages = new Messages();
			messages.properties.loadFromXML(inputStream);
			return messages;
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * Instantiate {@link Messages} omitting {@link IOException} check.
	 * @param inputStream properties file
	 * @return instance
	 */
	public static Messages loadProperties(InputStream inputStream) {
		try {
			Messages messages = new Messages();
			messages.properties.load(inputStream);
			return messages;
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	protected Properties getProperties() {
		return properties;
	}

	/**
	 * Get value from properties.
	 * @param key
	 * @return
	 * @throws IllegalArgumentException key not found
	 */
	public String get(String key) {
		String value = properties.getProperty(key);
		if (value == null) {
			throw new IllegalArgumentException("key not found: " + key);
		}
		return value;
	}

	/**
	 * Format message.
	 * @param key
	 * @param arguments
	 * @return
	 * @throws IllegalArgumentException key not found
	 */
	public String format(String key, Object... arguments) {
		return MessageFormat.format(get(key), arguments);
	}

}
