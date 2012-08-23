package org.hidetake.taskwalls.controller;

import java.util.Date;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.model.oauth2.ClientCredential;
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
	 * This method creates a session and adds into header.
	 * 
	 * @param tester
	 */
	public static void enableSession(ControllerTester tester) {
		ClientCredential credential = new ClientCredential(
				"ClientCredential#clientId", "ClientCredential#clientSecret");

		long now = System.currentTimeMillis();
		Session session = new Session();
		session.setAccessToken("accessToken");
		session.setRefreshToken("refreshToken");
		session.setExpiration(new Date(now));

		tester.response.setHeader(Constants.HEADER_SESSION,
				SessionService.encodeAndEncryptAsBase64(session, credential));
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
