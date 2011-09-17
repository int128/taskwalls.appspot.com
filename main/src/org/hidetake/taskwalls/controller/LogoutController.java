package org.hidetake.taskwalls.controller;

import javax.servlet.http.Cookie;

import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;

/**
 * Logout current session.
 * @author hidetake.org
 */
public class LogoutController extends ControllerBase
{

	@Override
	public Navigation run() throws Exception
	{
		Memcache.delete(sessionKey);
		Cookie sessionCookie = new Cookie(COOKIE_KEY_SESSIONID, "");
		sessionCookie.setMaxAge(0);
		response.addCookie(sessionCookie);
		return redirect("./");
	}

}
