package org.hidetake.taskwalls.util.googleapi;

/**
 * Locator for {@link TasksServiceFactory}.
 * 
 * @author hidetake.org
 */
public class TasksServiceFactoryLocator {

	private static TasksServiceFactory instance = new TasksServiceFactory.Default();

	/**
	 * Get the factory instance.
	 * This method returns {@link TasksServiceFactory.Default} instance
	 * unless {@link #set(TasksServiceFactory)} called.
	 * 
	 * @return
	 */
	public static TasksServiceFactory get() {
		return instance;
	}

	/**
	 * Set the factory instance.
	 * 
	 * @param factory
	 */
	public static void set(TasksServiceFactory factory) {
		instance = factory;
	}

	private TasksServiceFactoryLocator() {
	}

}
