package org.hidetake.taskwalls.controller;

import java.util.Date;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.model.oauth2.CachedToken;
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
		Date expire = new Date(System.currentTimeMillis() + 3600 * 1000L);
		CachedToken cachedToken = new CachedToken("access", "refresh", expire);
		Memcache.put("testSession", cachedToken);
		tester.request.addCookie(new Cookie("s", "testSession"));
	}

}
