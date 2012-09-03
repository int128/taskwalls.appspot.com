package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.net.URI;
import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.service.GoogleOAuth2Service;
import org.hidetake.taskwalls.service.SessionManager;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.hidetake.taskwalls.util.StackTraceUtil;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.HttpResponseException;

/**
 * Authorize and begin session.
 * 
 * @author hidetake.org
 */
public class Oauth2Controller extends Controller {

	private static final Logger logger = Logger.getLogger(Oauth2Controller.class.getName());

	protected GoogleOAuth2Service oauth2Service = new GoogleOAuth2Service(AppCredential.CLIENT_CREDENTIAL);

	@Override
	public Navigation run() throws Exception {
		if (!AjaxPreconditions.isXHR(request)) {
			return preconditionFailed("should be XHR");
		}
		String authorizationCode = asString("code");
		if (authorizationCode == null) {
			return preconditionFailed("code is null");
		}

		GoogleTokenResponse tokenResponse = oauth2Service.exchange(authorizationCode, getRedirectURI());
		String session = SessionManager.serialize(tokenResponse, AppCredential.CLIENT_CREDENTIAL);

		response.setHeader(Constants.HEADER_SESSION, session);
		return null;
	}

	protected String getRedirectURI() {
		return URI.create(request.getRequestURL().toString()).resolve("/").toASCIIString();
	}

	@Override
	protected Navigation handleError(Throwable e) throws Throwable {
		if (e instanceof HttpResponseException) {
			HttpResponseException httpResponseException = (HttpResponseException) e;
			logger.severe(httpResponseException.getStatusMessage());
			logger.severe(StackTraceUtil.format(e));
		}
		return super.handleError(e);
	}

	private Navigation preconditionFailed(String logMessage) throws IOException {
		logger.warning(logMessage);
		response.sendError(Constants.STATUS_PRECONDITION_FAILED);
		return null;
	}

}
