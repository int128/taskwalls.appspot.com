package org.hidetake.taskwalls.controller;

import javax.servlet.http.Cookie;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

/**
 * Logout current session.
 * @author hidetake.org
 */
public class LogoutController extends Controller
{

	@Override
	public Navigation run() throws Exception
	{
		Cookie sessionCookie = new Cookie(ControllerBase.COOKIE_KEY_SESSIONID, "");
		sessionCookie.setMaxAge(0);
		response.addCookie(sessionCookie);
		return redirect("./");
	}

}
