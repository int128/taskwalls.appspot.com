package org.hidetake.taskwalls.controller;

import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.util.StackTraceUtil;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;

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
			String sessionKey = null;
			for (Cookie cookie : request.getCookies()) {
				// find session key
				if (Oauth2Controller.COOKIE_SESSIONID.equals(cookie.getName())) {
					sessionKey = cookie.getValue();
				}
				// delete the cookie
				cookie.setMaxAge(0);
				response.addCookie(cookie);
			}
			if (sessionKey != null) {
				// delete the session
				Memcache.delete(sessionKey);
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
