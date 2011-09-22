package org.hidetake.taskwalls.controller.errors;

import java.util.logging.Logger;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

public class NoSessionController extends Controller
{

	private static final Logger logger = Logger.getLogger(NoSessionController.class.getName());

	@Override
	public Navigation run() throws Exception
	{
		logger.warning("Session has been expired or not found");
		response.sendError(403);
		return null;
	}

}
