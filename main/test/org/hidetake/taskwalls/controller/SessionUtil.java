package org.hidetake.taskwalls.controller;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.service.oauth2.CachedToken;
import org.slim3.memcache.Memcache;
import org.slim3.tester.ControllerTester;

/**
 * Session utility class for test.
 * @author hidetake.org
 */
public class SessionUtil
{

	/**
	 * Enables the session.
	 * @param tester
	 */
	public static void enable(ControllerTester tester)
	{
		CachedToken cachedToken = new CachedToken("access", "refresh");
		Memcache.put("testSession", cachedToken);
		tester.request.addCookie(new Cookie("s", "testSession"));
	}

}
