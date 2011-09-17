package org.hidetake.taskwalls.util;

import javax.servlet.http.HttpServletRequest;

public class TaskQueueUtil
{

	public static final String HEADER_APPENGINE_QUEUENAME = "X-AppEngine-QueueName";
	public static final String HEADER_APPENGINE_TASKNAME = "X-AppEngine-TaskName";
	public static final String HEADER_APPENGINE_TASKRETRYCOUNT = "X-AppEngine-TaskRetryCount";

	private TaskQueueUtil()
	{
	}

	/**
	 * Returns the queue name.
	 * @param request
	 * @return queue name or null if request is not task
	 */
	public static String getQueueName(HttpServletRequest request)
	{
		if (request == null) {
			throw new NullPointerException("request is null");
		}
		return request.getHeader(HEADER_APPENGINE_QUEUENAME);
	}

	/**
	 * Returns task name.
	 * @param request
	 * @return task name or null if request is not task
	 */
	public static String getTaskName(HttpServletRequest request)
	{
		if (request == null) {
			throw new NullPointerException("request is null");
		}
		return request.getHeader(HEADER_APPENGINE_TASKNAME);
	}

	/**
	 * Returns task retry count.
	 * @param request
	 * @return task retry count or -1 if request is not task
	 */
	public static int getRetryCount(HttpServletRequest request)
	{
		if (request == null) {
			throw new NullPointerException("request is null");
		}
		try {
			String retryCount = request.getHeader(HEADER_APPENGINE_TASKRETRYCOUNT);
			return Integer.parseInt(retryCount);
		}
		catch (NumberFormatException e) {
			return -1;
		}
	}

}
