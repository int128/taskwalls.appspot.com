package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.service.GoogleOAuth2Service;
import org.hidetake.taskwalls.service.SessionManager;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.hidetake.taskwalls.util.StackTraceUtil;
import org.hidetake.taskwalls.util.googleapis.HttpTransportLocator;
import org.hidetake.taskwalls.util.googleapis.JsonFactoryLocator;
import org.hidetake.taskwalls.util.googleapis.TasksRequestInitializer;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.HttpResponseException;
import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.Tasks;

/**
 * Base controller class.
 * <p>
 * This controller accepts requests that satisfy conditions:
 * <ul>
 * <li>XHR</li>
 * <li>session header</li>
 * <li>valid access token</li>
 * <li>validation passed {@link #validate()}</li>
 * </ul>
 * </p>
 * 
 * @author hidetake.org
 */
public abstract class ControllerBase extends Controller {

	private static final Logger logger = Logger.getLogger(ControllerBase.class.getName());

	protected Tasks tasksService;

	/**
	 * Validate the request.
	 * 
	 * @return true if valid
	 */
	protected abstract boolean validate();

	/**
	 * Process the request.
	 * 
	 * @return JSON object for response
	 */
	protected abstract GenericJson response() throws Exception;

	@Override
	protected Navigation run() throws Exception {
		if (!AjaxPreconditions.isXHR(request)) {
			return errorStatus(Constants.STATUS_PRECONDITION_FAILED, "should be XHR");
		}

		String session = request.getHeader(Constants.HEADER_SESSION);
		if (session == null) {
			return errorStatus(Constants.STATUS_PRECONDITION_FAILED, "No session header");
		}
		GoogleTokenResponse tokenResponse = SessionManager.restore(session, AppCredential.CLIENT_CREDENTIAL);
		if (tokenResponse == null) {
			return errorStatus(Constants.STATUS_PRECONDITION_FAILED, "Invalid session header");
		}

		if (!validate()) {
			return errorStatus(Constants.STATUS_PRECONDITION_FAILED, "Validation failed: " + errors.toString());
		}

		GoogleCredential credential = GoogleOAuth2Service.buildCredential(tokenResponse,
				AppCredential.CLIENT_CREDENTIAL);
		tasksService = new Tasks.Builder(HttpTransportLocator.get(), JsonFactoryLocator.get(), credential)
				.setJsonHttpRequestInitializer(new TasksRequestInitializer(request.getRemoteAddr()))
				.build();

		GenericJson responseJson = response();

		if (responseJson != null) {
			response.setHeader("X-Content-Type-Options", "nosniff");
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().append(responseJson.toString());
			response.flushBuffer();
		}
		return null;
	}

	@Override
	protected Navigation handleError(Throwable e) throws Throwable {
		if (e instanceof HttpResponseException) {
			HttpResponseException httpResponseException = (HttpResponseException) e;
			logger.severe(httpResponseException.getStatusMessage());
			logger.severe(StackTraceUtil.format(e));
			if (httpResponseException.getStatusCode() == 401) {
				return errorStatus(Constants.STATUS_NO_SESSION, "Google API returns 401 invalid credentials");
			}
		}
		return super.handleError(e);
	}

	private Navigation errorStatus(int code, String logMessage) throws IOException {
		logger.warning(logMessage);
		response.sendError(code);
		return null;
	}

}