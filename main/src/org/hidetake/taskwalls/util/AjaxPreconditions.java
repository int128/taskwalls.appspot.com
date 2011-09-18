package org.hidetake.taskwalls.util;

import javax.servlet.http.HttpServletRequest;

public class AjaxPreconditions
{

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
		return "XMLHttpRequest".equals(request.getHeader("X-Requested-With"));
	}

}
