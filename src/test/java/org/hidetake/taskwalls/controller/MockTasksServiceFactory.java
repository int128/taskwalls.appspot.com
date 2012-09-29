package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.util.googleapi.TasksServiceFactory;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.services.tasks.Tasks;

public class MockTasksServiceFactory implements TasksServiceFactory {

	private final Tasks mock;

	public MockTasksServiceFactory(Tasks mock) {
		this.mock = mock;
	}

	@Override
	public Tasks build(GoogleCredential credential, String remoteAddr) {
		return mock;
	}

}
