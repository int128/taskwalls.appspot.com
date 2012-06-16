package org.hidetake.taskwalls.tools.deployment;

import java.util.logging.Logger;

import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;

public class YUICompressorErrorReporter implements ErrorReporter {
	private static Logger logger = Logger.getLogger(YUICompressorErrorReporter.class.getName());

	public void warning(String message, String sourceName, int line, String lineSource, int lineOffset) {
		logger.warning(message);
	}

	public void error(String message, String sourceName, int line, String lineSource, int lineOffset) {
		logger.severe(message);
	}

	public EvaluatorException runtimeError(String message, String sourceName, int line, String lineSource,
			int lineOffset) {
		error(message, sourceName, line, lineSource, lineOffset);
		return new EvaluatorException(message);
	}
}