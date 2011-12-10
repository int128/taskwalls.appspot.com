package org.hidetake.taskwalls.util.googleapis;

import java.io.IOException;

import com.google.api.client.http.HttpResponseException;

/**
 * Utility class for {@link HttpResponseException}.
 * 
 * @author hidetake.org
 */
public class HttpResponseExceptionUtil
{

	private HttpResponseExceptionUtil()
	{
	}

	/**
	 * Get the error message in JSON response.
	 * @param e exception
	 * @return error message
	 */
	public static String getMessage(HttpResponseException e)
	{
		if (e == null) {
			throw new NullPointerException("e is null");
		}
		if (e.getResponse() == null) {
			return e.getLocalizedMessage();
		}
		try {
			return e.getResponse().parseAsString();
		}
		catch (IOException ioException) {
			// ignore internal exception
			return e.getLocalizedMessage();
		}
	}

}
