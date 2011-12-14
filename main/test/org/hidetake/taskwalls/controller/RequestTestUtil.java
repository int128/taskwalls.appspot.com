package org.hidetake.taskwalls.controller;

import java.util.Date;
import java.util.UUID;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.model.oauth2.CachedToken;
import org.hidetake.taskwalls.service.SessionService;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.tester.ControllerTester;

/**
 * Request utility class for tests.
 * @author hidetake.org
 */
public class RequestTestUtil {

	/**
	 * Enables the session.
	 * This method creates a session and adds the cookie and header.
	 * 
	 * @param tester
	 * @return session ID
	 */
	public static String enableSession(ControllerTester tester) {
		Date expire = new Date(System.currentTimeMillis() + 3600 * 1000L);
		CachedToken cachedToken = new CachedToken("access", "refresh", expire);
		String sessionID = UUID.randomUUID().toString();
		Session session = new Session();
		session.setKey(Session.createKey(sessionID));
		session.setToken(cachedToken);
		SessionService.put(session);
		tester.request.addCookie(new Cookie(Constants.COOKIE_SESSION_ID, sessionID));
		tester.request.setHeader(Constants.HEADER_SESSION_ID, sessionID);
		return sessionID;
	}

	/**
	 * Set the request method as POST.
	 * 
	 * @param tester
	 */
	public static void setMethodAsPost(ControllerTester tester) {
		tester.request.setMethod("POST");
	}

	/**
	 * Set the request as XHR.
	 * 
	 * @param tester
	 */
	public static void setXHR(ControllerTester tester) {
		tester.request.setHeader(AjaxPreconditions.XHR_HEADER_NAME,
				AjaxPreconditions.XHR_HEADER_VALUE);
	}

}
