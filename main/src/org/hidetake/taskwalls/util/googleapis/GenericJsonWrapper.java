package org.hidetake.taskwalls.util.googleapis;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

import com.google.api.client.json.GenericJson;
import com.google.api.client.json.JsonEncoding;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.JsonGenerator;

/**
 * Wrapper class of {@link GenericJson}.
 * 
 * @deprecated
 * @author hidetake.org
 */
public class GenericJsonWrapper {

	/**
	 * Workaround for {@link JsonFactory#toString(Object)}.
	 * 
	 * @param item data key/value pairs
	 * @return serialized JSON string representation
	 * @deprecated fixed bug in google-api-client-java 1.6.0
	 */
	public static String toString(GenericJson item) {
		ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
		try {
			JsonGenerator generator = item.jsonFactory.createJsonGenerator(byteStream, JsonEncoding.UTF8);
			generator.serialize(item);
			generator.flush();
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}
		try {
			return byteStream.toString("UTF-8");
		}
		catch (UnsupportedEncodingException e) {
			throw new RuntimeException(e);
		}
	}

}
