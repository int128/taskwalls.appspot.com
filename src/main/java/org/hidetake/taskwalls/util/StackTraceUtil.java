package org.hidetake.taskwalls.util;

import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * Stack trace utility.
 * 
 * @author hidetake.org
 */
public class StackTraceUtil {

	private StackTraceUtil() {
	}

	/**
	 * Returns stack trace message.
	 * 
	 * @param throwable
	 * @return
	 */
	public static String format(Throwable throwable) {
		StringWriter writer = new StringWriter();
		throwable.printStackTrace(new PrintWriter(writer));
		return writer.toString();
	}

}
