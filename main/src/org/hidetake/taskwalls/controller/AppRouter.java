package org.hidetake.taskwalls.controller;

import org.slim3.controller.router.Router;
import org.slim3.controller.router.RouterImpl;

/**
 * {@link Router}.
 * @author hidetake.org
 */
public class AppRouter extends RouterImpl
{

	/**
	 * Route definitions.
	 */
	public AppRouter()
	{
		addRouting("/tasks/v1/lists/{id}/clear", "/googleApiProxy?path=/tasks/v1/lists/{id}/clear");
		addRouting("/tasks/v1/users/{id}/lists", "/googleApiProxy?path=/tasks/v1/users/{id}/lists");
	}

}
