package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.service.SessionManager;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.tester.ControllerTester;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;

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
		GoogleTokenResponse tokenResponse = new GoogleTokenResponse();
		tokenResponse.setAccessToken("accessToken");
		tokenResponse.setRefreshToken("refreshToken");
		tokenResponse.setExpiresInSeconds(3600L);
		tester.request.setHeader(Constants.HEADER_SESSION,
				SessionManager.serialize(tokenResponse, AppCredential.CLIENT_CREDENTIAL));
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
	 * Set the request method as PUT.
	 * 
	 * @param tester
	 */
	public static void setMethodAsPut(ControllerTester tester) {
		tester.request.setMethod("PUT");
	}

	/**
	 * Set the request method as DELETE.
	 * 
	 * @param tester
	 */
	public static void setMethodAsDelete(ControllerTester tester) {
		tester.request.setMethod("DELETE");
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
