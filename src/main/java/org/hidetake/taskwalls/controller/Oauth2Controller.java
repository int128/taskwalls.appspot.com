package org.hidetake.taskwalls.controller;

import java.net.URI;
import java.util.UUID;
import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.service.GoogleOAuth2Service;
import org.hidetake.taskwalls.service.SessionService;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.hidetake.taskwalls.util.DigestGenerator;
import org.hidetake.taskwalls.util.googleapis.HttpResponseExceptionUtil;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

import com.google.api.client.http.HttpResponseException;

/**
 * Authorize and begin session.
 * 
 * @author hidetake.org
 */
public class Oauth2Controller extends Controller {

	private static final Logger logger = Logger.getLogger(Oauth2Controller.class.getName());

	/**
	 * OAuth 2.0 service.
	 */
	protected GoogleOAuth2Service oauth2Service = new GoogleOAuth2Service(
			AppCredential.CLIENT_CREDENTIAL);

	@Override
	public Navigation run() throws Exception {
		if (!isPost()) {
			logger.warning("Precondition failed: not POST");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}
		if (!AjaxPreconditions.isXHR(request)) {
			logger.warning("Precondition failed: not XHR");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}
		String authorizationCode = asString("code");
		if (authorizationCode == null) {
			logger.warning("Precondition failed: code is null");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}

		// exchange authorization code for token
		Session session = oauth2Service.exchange(authorizationCode, getRedirectURI());

		// start a session
		String sessionID = DigestGenerator.create().update(
				UUID.randomUUID(),
				AppCredential.CLIENT_CREDENTIAL.getClientId(),
				AppCredential.CLIENT_CREDENTIAL.getClientSecret(),
				authorizationCode,
				session.getAccessToken(),
				session.getRefreshToken()).getAsHexString();
		session.setKey(Session.createKey(sessionID));
		SessionService.put(session);

		// return session ID as header
		response.setHeader(Constants.HEADER_SESSION_ID, sessionID);
		return null;
	}

	protected String getRedirectURI() {
		return URI.create(request.getRequestURL().toString()).resolve("/").toASCIIString();
	}

	@Override
	protected Navigation handleError(Throwable e) throws Throwable {
		if (e instanceof HttpResponseException) {
			logger.severe(HttpResponseExceptionUtil.getMessage((HttpResponseException) e));
		}
		return super.handleError(e);
	}

}
