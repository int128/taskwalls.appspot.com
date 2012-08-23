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
 * Base controller class that depends on Google Tasks API.
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
			return setUpServices();
		} catch (IOException e) {
			throw ThrowableUtil.wrap(e);
		}
	}

	protected Navigation setUpServices() throws IOException {
		String sessionHeader = request.getHeader(Constants.HEADER_SESSION);
		if (sessionHeader == null) {
			logger.warning("Precondition failed: no session header");
			response.sendError(Constants.STATUS_PRECONDITION_FAILED);
			return null;
		}

		Session session = SessionService.decryptAndDecodeFromBase64(
				sessionHeader, AppCredential.CLIENT_CREDENTIAL);
		if (session == null) {
			logger.warning("Session header corrupted");
			response.sendError(Constants.STATUS_NO_SESSION);
			return null;
		}

		// refresh token if expired
		if (session.isExpired()) {
			if (session.getRefreshToken() == null) {
				logger.warning("Refresh token is null, please re-authorize");
				response.sendError(Constants.STATUS_NO_SESSION);
				return null;
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
					// 401 invalid credentials
					response.sendError(Constants.STATUS_NO_SESSION);
					return null;
				}
			}
		}
		return super.handleError(e);
	}

}