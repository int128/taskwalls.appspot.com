package org.hidetake.taskwalls.controller;

import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.service.SessionService;
import org.hidetake.taskwalls.util.StackTraceUtil;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

/**
 * Logout current session.
 * This controller deletes the session.
 * 
 * @author hidetake.org
 */
public class LogoutController extends Controller {

	private static final Logger logger = Logger.getLogger(LogoutController.class.getName());

	@Override
	public Navigation run() throws Exception {
		String sessionID = request.getHeader(Constants.HEADER_SESSION_ID);
		if (sessionID != null) {
			SessionService.delete(sessionID);
		}
		return null;
	}

	@Override
	protected Navigation handleError(Throwable error) throws Throwable {
		// silence is golden
		logger.severe(StackTraceUtil.format(error));
		return null;
	}

}
