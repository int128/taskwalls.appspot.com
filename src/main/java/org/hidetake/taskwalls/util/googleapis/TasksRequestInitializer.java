package org.hidetake.taskwalls.util.googleapis;

import java.io.IOException;

import com.google.api.client.http.json.JsonHttpRequest;
import com.google.api.client.http.json.JsonHttpRequestInitializer;
import com.google.api.services.tasks.TasksRequest;

/**
 * Request initializer for {@link TasksRequest}.
 * 
 * @author hidetake.org
 */
public class TasksRequestInitializer implements JsonHttpRequestInitializer {

	private final String userIp;

	/**
	 * Constructor.
	 * 
	 * @param userIp client IP address
	 */
	public TasksRequestInitializer(String userIp) {
		this.userIp = userIp;
	}

	@Override
	public void initialize(JsonHttpRequest jsonHttpRequest) throws IOException {
		TasksRequest tasksRequest = (TasksRequest) jsonHttpRequest;
		tasksRequest.setUserIp(userIp);
	}

}