package org.hidetake.taskwalls.util.googleapi;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.services.tasks.Tasks;

/**
 * Factory for Google Tasks API service class.
 * 
 * @author hidetake.org
 */
public interface TasksServiceFactory {

	/**
	 * Build an instance.
	 * 
	 * @param credential
	 * @param remoteAddr
	 * @return
	 */
	public Tasks build(GoogleCredential credential, String remoteAddr);

	/**
	 * Default implementation of {@link TasksServiceFactory}.
	 */
	public static class Default implements TasksServiceFactory {
		@Override
		public Tasks build(GoogleCredential credential, String remoteAddr) {
			return new Tasks.Builder(HttpTransportLocator.get(), JsonFactoryLocator.get(), credential)
					.setJsonHttpRequestInitializer(new TasksRequestInitializer(remoteAddr))
					.build();
		}
	}

}
