package org.hidetake.taskwalls.controller;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletResponse;

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
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.JsonGenerator;
import com.google.api.services.tasks.Tasks;

/**
 * Base controller class.
 * <p>
 * This controller accepts requests that satisfy conditions:
 * <ul>
 * <li>XHR</li>
 * <li>session header</li>
 * <li>valid access token</li>
 * </ul>
 * </p>
 * 
 * @author hidetake.org
 */
public abstract class ControllerBase extends Controller {

	private static final Logger logger = Logger.getLogger(ControllerBase.class.getName());

	protected Tasks tasksService;

	@Override
	protected Navigation run() throws Exception {
		if (!AjaxPreconditions.isXHR(request)) {
			return preconditionFailed("should be XHR");
		}

		String session = request.getHeader(Constants.HEADER_SESSION);
		if (session == null) {
			return preconditionFailed("No session header");
		}
		GoogleTokenResponse tokenResponse = SessionManager.restore(session, AppCredential.CLIENT_CREDENTIAL);
		if (tokenResponse == null) {
			return preconditionFailed("Invalid session header");
		}

		GoogleCredential credential = GoogleOAuth2Service.buildCredential(tokenResponse,
				AppCredential.CLIENT_CREDENTIAL);
		tasksService = new Tasks.Builder(HttpTransportLocator.get(), JsonFactoryLocator.get(), credential)
				.setJsonHttpRequestInitializer(new TasksRequestInitializer(request.getRemoteAddr()))
				.build();

		GenericJson jsonResponse = handle();
		if (jsonResponse != null) {
			response.setHeader("X-Content-Type-Options", "nosniff");
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			JsonGenerator jsonGenerator = JsonFactoryLocator.get().createJsonGenerator(response.getWriter());
			jsonGenerator.serialize(jsonResponse);
			jsonGenerator.close();
			response.flushBuffer();
		}
		return null;
	}

	/**
	 * Handle the request.
	 * 
	 * @return JSON response
	 * @throws Exception
	 */
	protected GenericJson handle() throws Exception {
		if (isGet()) {
			return get();
		} else if (isPost()) {
			return post();
		} else if (isPut()) {
			return put();
		} else if (isDelete()) {
			return delete();
		} else {
			return handleUnknownMethod();
		}
	}

	protected GenericJson get() throws Exception {
		response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
		return null;
	}

	protected GenericJson post() throws Exception {
		response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
		return null;
	}

	protected GenericJson put() throws Exception {
		response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
		return null;
	}

	protected GenericJson delete() throws Exception {
		response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
		return null;
	}

	protected GenericJson handleUnknownMethod() throws Exception {
		response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
		return null;
	}

	/**
	 * Parse JSON from request body.
	 * 
	 * @param destinationClass
	 * @return an instance
	 * @throws IOException
	 * @see {@link JsonFactory#fromReader(java.io.Reader, Class)}
	 */
	protected <T> T parseJsonAs(Class<T> destinationClass) throws IOException {
		return JsonFactoryLocator.get().fromReader(request.getReader(), destinationClass);
	}

	/**
	 * Send response as precondition failed.
	 * 
	 * @param logMessage
	 * @return always <code>null</code>
	 * @throws IOException
	 */
	protected <T> T preconditionFailed(String logMessage) throws IOException {
		logger.warning(logMessage);
		response.sendError(Constants.STATUS_PRECONDITION_FAILED);
		return null;
	}

	@Override
	protected Navigation handleError(Throwable e) throws Throwable {
		if (e instanceof HttpResponseException) {
			HttpResponseException httpResponseException = (HttpResponseException) e;
			logger.severe(httpResponseException.getStatusMessage());
			logger.severe(StackTraceUtil.format(e));
			if (httpResponseException.getStatusCode() == 401) {
				logger.warning("Google API returns 401 invalid credentials");
				response.sendError(Constants.STATUS_NO_SESSION);
				return null;
			}
		}
		return super.handleError(e);
	}

}