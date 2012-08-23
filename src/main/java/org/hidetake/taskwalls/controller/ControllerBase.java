package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.util.logging.Logger;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.service.GoogleOAuth2Service;
import org.hidetake.taskwalls.service.SessionService;
import org.hidetake.taskwalls.util.googleapis.HttpResponseExceptionUtil;
import org.hidetake.taskwalls.util.googleapis.JacksonFactoryLocator;
import org.hidetake.taskwalls.util.googleapis.NetHttpTransportLocator;
import org.hidetake.taskwalls.util.googleapis.TasksRequestInitializer;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.util.ThrowableUtil;

import com.google.api.client.googleapis.auth.oauth2.draft10.GoogleAccessProtectedResource;
import com.google.api.client.http.HttpResponse;
import com.google.api.client.http.HttpResponseException;
import com.google.api.client.json.GenericJson;
import com.google.api.services.tasks.Tasks;

/**
 * Base controller class.
 * 
 * @author hidetake.org
 */
public abstract class ControllerBase extends Controller {

	private static final Logger logger = Logger.getLogger(ControllerBase.class.getName());

	/**
	 * Tasks API service.
	 * This field must be initialized at {@link #setUp()}.
	 */
	protected Tasks tasksService;

	/**
	 * OAuth 2.0 service.
	 */
	protected GoogleOAuth2Service oauth2Service = new GoogleOAuth2Service(
			AppCredential.CLIENT_CREDENTIAL);

	/**
	 * Validate the request.
	 * 
	 * @return true if valid
	 */
	protected boolean validate() {
		return true;
	}

	/**
	 * Returns JSON response.
	 * 
	 * @param object
	 *            object to serialize as JSON
	 * @return always null
	 * @throws IOException
	 */
	protected Navigation jsonResponse(GenericJson object) throws IOException {
		response.setHeader("X-Content-Type-Options", "nosniff");
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().append(object == null ? "null" : object.toString());
		response.flushBuffer();
		return null;
	}

	@Override
	protected Navigation setUp() {
		try {
			if (checkPreconditions()) {
				setUpServices();
			}
			return null;
		} catch (IOException e) {
			throw ThrowableUtil.wrap(e);
		}
	}

	@Override
	protected Navigation handleError(Throwable e) throws Throwable {
		if (e instanceof HttpResponseException) {
			HttpResponseException httpResponseException = (HttpResponseException) e;
			logger.severe(HttpResponseExceptionUtil.getMessage(httpResponseException));
			HttpResponse httpResponse = httpResponseException.getResponse();
			if (httpResponse != null) {
				if (httpResponse.getStatusCode() == 401) {
					// 401 invalid credentials
					response.sendError(Constants.STATUS_NO_SESSION);
					return null;
				}
			}
		}
		return super.handleError(e);
	}

	private boolean checkPreconditions() throws IOException {
		if (request.getHeader(Constants.HEADER_SESSION) == null) {
			logger.warning("No session header");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return false;
		}
		if (!validate()) {
			logger.warning("Validation failed: " + errors.toString());
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return false;
		}
		return true;
	}

	private void setUpServices() throws IOException {
		Session session = SessionService.decryptAndDecodeFromBase64(
				request.getHeader(Constants.HEADER_SESSION), AppCredential.CLIENT_CREDENTIAL);
		if (session == null) {
			logger.warning("Session header corrupted");
			response.sendError(Constants.STATUS_NO_SESSION);
			return;
		}

		// refresh token if expired
		if (session.isExpired()) {
			if (session.getRefreshToken() == null) {
				logger.warning("Refresh token is null, please re-authorize");
				response.sendError(Constants.STATUS_NO_SESSION);
				return;
			}
			oauth2Service.refresh(session);
		}

		// instantiate service
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
	}

}