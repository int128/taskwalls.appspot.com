package org.hidetake.taskwalls.controller;

import java.util.Date;
import java.util.UUID;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.service.SessionService;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.tester.ControllerTester;

/**
 * Request utility class for tests.
 * 
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
		Date expiration = new Date(System.currentTimeMillis() + 3600 * 1000L);
		String sessionID = UUID.randomUUID().toString();
		Session session = new Session();
		session.setKey(Session.createKey(sessionID));
		session.setAccessToken("accessToken");
		session.setRefreshToken("refreshToken");
		session.setExpiration(expiration);
		SessionService.put(session);
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
