package org.hidetake.taskwalls.util.googleapis;

import java.io.IOException;

import com.google.api.client.http.json.JsonHttpRequest;
import com.google.api.client.http.json.JsonHttpRequestInitializer;
import com.google.api.services.tasks.TasksRequest;

/**
 * Request initializer for {@link TasksRequest}.
 * @author hidetake.org
 */
public class TasksRequestInitializer implements JsonHttpRequestInitializer
{

	private String userIp;

	/**
	 * @see TasksRequest#setUserIp(String)
	 * @param userIp
	 */
	public void setUserIp(String userIp)
	{
		this.userIp = userIp;
	}

	@Override
	public void initialize(JsonHttpRequest jsonHttpRequest) throws IOException
	{
		TasksRequest tasksRequest = (TasksRequest) jsonHttpRequest;
		tasksRequest.setUserIp(userIp);
	}

}