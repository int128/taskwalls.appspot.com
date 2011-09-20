package org.hidetake.taskwalls.controller;

import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.util.StackTraceUtil;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;

/**
 * Logout current session.
 * @author hidetake.org
 */
public class LogoutController extends Controller
{

	private static final Logger logger = Logger.getLogger(LogoutController.class.getName());

	@Override
	public Navigation run() throws Exception
	{
		if (request.getCookies() != null) {
			String sessionKey = null;
			for (Cookie cookie : request.getCookies()) {
				if (ControllerBase.COOKIE_KEY_SESSIONID.equals(cookie.getName())) {
					sessionKey = cookie.getValue();
					break;
				}
			}
			if (sessionKey != null) {
				// delete the session
				Memcache.delete(sessionKey);
			}
			// delete the cookie
			Cookie sessionCookie = new Cookie(ControllerBase.COOKIE_KEY_SESSIONID, "");
			sessionCookie.setMaxAge(0);
			response.addCookie(sessionCookie);
		}
		return redirect("./");
	}

	@Override
	protected Navigation handleError(Throwable error) throws Throwable
	{
		// redirect anyway
		logger.severe(StackTraceUtil.format(error));
		return redirect("./");
	}

}
