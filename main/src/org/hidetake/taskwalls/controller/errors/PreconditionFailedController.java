package org.hidetake.taskwalls.controller.errors;

import java.util.logging.Logger;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

public class PreconditionFailedController extends Controller
{

	private static final Logger logger = Logger.getLogger(
			PreconditionFailedController.class.getName());

	@Override
	public Navigation run() throws Exception
	{
		logger.warning("Precondition failed: errors=" + errors.toString());
		response.sendError(400);
		return null;
	}

}
