package org.hidetake.taskwalls.controller;

import java.net.URI;
import java.util.UUID;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.model.oauth2.CachedToken;
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
		CachedToken token = oauth2Service.exchange(authorizationCode, getRedirectURI());

		// start a session
		String sessionID = DigestGenerator.create().update(
				UUID.randomUUID(),
				AppCredential.CLIENT_CREDENTIAL.getClientId(),
				AppCredential.CLIENT_CREDENTIAL.getClientSecret(),
				authorizationCode,
				token.getAccessToken(),
				token.getRefreshToken()).getAsHexString();
		Session session = new Session();
		session.setKey(Session.createKey(sessionID));
		session.setToken(token);
		SessionService.put(session);

		Cookie cookie = new Cookie(Constants.COOKIE_SESSION_ID, sessionID);
		cookie.setMaxAge(Constants.SESSION_EXPIRATION);
		response.addCookie(cookie);
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
