package org.hidetake.taskwalls.model;

/**
 * Represents repeats of a task.
 * 
 * @author hidetake.org
 */
public enum TaskRepeat {

	ONCE,
	WEEKLY,
	MONTHLY,
	YEARLY;

	public static final String REGEXP_PATTERN;

	static {
		StringBuilder builder = new StringBuilder();
		for (TaskRepeat repeat : TaskRepeat.values()) {
			builder.append(repeat.toString());
			builder.append("|");
		}
		REGEXP_PATTERN = builder.substring(0, builder.length() - 1);
	}

}
