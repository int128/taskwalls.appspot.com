package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.service.GoogleOAuth2Service;
import org.hidetake.taskwalls.service.SessionService;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.hidetake.taskwalls.util.googleapis.HttpResponseExceptionUtil;
import org.hidetake.taskwalls.util.googleapis.JacksonFactoryLocator;
import org.hidetake.taskwalls.util.googleapis.NetHttpTransportLocator;
import org.hidetake.taskwalls.util.googleapis.TasksRequestInitializer;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessProtectedResource;
import com.google.api.client.http.HttpResponse;
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

	protected GoogleOAuth2Service oauth2Service = new GoogleOAuth2Service(AppCredential.CLIENT_CREDENTIAL);
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
		// check preconditions
		if (!AjaxPreconditions.isXHR(request)) {
			return errorStatus(Constants.STATUS_PRECONDITION_FAILED, "should be XHR");
		}
		String sessionHeader = request.getHeader(Constants.HEADER_SESSION);
		if (sessionHeader == null) {
			return errorStatus(Constants.STATUS_PRECONDITION_FAILED, "No session header");
		}
		Session session = SessionService.decryptAndDecodeFromBase64(sessionHeader, AppCredential.CLIENT_CREDENTIAL);
		if (session == null) {
			return errorStatus(Constants.STATUS_PRECONDITION_FAILED, "Session header corrupted");
		}
		if (!validate()) {
			return errorStatus(Constants.STATUS_PRECONDITION_FAILED, "Validation failed: " + errors.toString());
		}

		// refresh token if expired
		if (session.isExpired()) {
			if (session.getRefreshToken() == null) {
				return errorStatus(Constants.STATUS_NO_SESSION, "Refresh token is null, try re-authorize");
			}
			oauth2Service.refresh(session);
		}

		// instantiate the service
		GoogleAccessProtectedResource resource = new GoogleAccessProtectedResource(
				session.getAccessToken(),
				NetHttpTransportLocator.get(),
				JacksonFactoryLocator.get(),
				AppCredential.CLIENT_CREDENTIAL.getClientId(),
				AppCredential.CLIENT_CREDENTIAL.getClientSecret(),
				session.getRefreshToken());
		tasksService = Tasks
				.builder(NetHttpTransportLocator.get(), JacksonFactoryLocator.get())
				.setHttpRequestInitializer(resource)
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
			logger.severe(HttpResponseExceptionUtil.getMessage(httpResponseException));
			HttpResponse httpResponse = httpResponseException.getResponse();
			if (httpResponse != null) {
				if (httpResponse.getStatusCode() == 401) {
					return errorStatus(Constants.STATUS_NO_SESSION, "Google API returns 401 invalid credentials");
				}
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