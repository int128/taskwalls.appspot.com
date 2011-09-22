package org.hidetake.taskwalls.util;

import javax.servlet.http.HttpServletRequest;

public class AjaxPreconditions
{

	public static final String XHR_HEADER_NAME = "X-Requested-With";
	public static final String XHR_HEADER_VALUE = "XMLHttpRequest";

	private AjaxPreconditions()
	{
	}

	/**
	 * XHR check.
	 * @param request
	 * @return true if the request is XHR
	 */
	public static boolean isXHR(HttpServletRequest request)
	{
		return XHR_HEADER_VALUE.equals(request.getHeader(XHR_HEADER_NAME));
	}

}
