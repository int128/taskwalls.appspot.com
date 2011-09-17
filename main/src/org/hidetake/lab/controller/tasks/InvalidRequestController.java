package org.hidetake.lab.controller.tasks;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

public class InvalidRequestController extends Controller
{

	@Override
	public Navigation run() throws Exception
	{
		response.sendError(403);
		response.flushBuffer();
		return null;
	}

}
