package org.hidetake.taskwalls.controller;

import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.service.SessionService;
import org.hidetake.taskwalls.util.StackTraceUtil;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

/**
 * Logout current session.
 * This controller deletes all cookies and the session.
 * 
 * @author hidetake.org
 */
public class LogoutController extends Controller
{

	private static final Logger logger = Logger.getLogger(LogoutController.class.getName());

	@Override
	public Navigation run() throws Exception
	{
		if (request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if (Constants.COOKIE_SESSION_ID.equals(cookie.getName())) {
					// delete the session
					String sessionID = cookie.getValue();
					SessionService.delete(sessionID);
				}
				// delete the cookie
				cookie.setMaxAge(0);
				response.addCookie(cookie);
			}
		}
		return redirect("/");
	}

	@Override
	protected Navigation handleError(Throwable error) throws Throwable
	{
		// redirect anyway
		logger.severe(StackTraceUtil.format(error));
		return redirect("/");
	}

}
