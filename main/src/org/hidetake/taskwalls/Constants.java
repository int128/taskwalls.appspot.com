package org.hidetake.taskwalls;

/**
 * Application constants.
 * 
 * @author hidetake.org
 */
public class Constants {

	/**
	 * Session expiration time in seconds.
	 */
	public static final int SESSION_EXPIRATION = 7 * 24 * 60 * 60;

	/**
	 * Cookie key of the session ID.
	 */
	public static final String COOKIE_SESSION_ID = "s";

	/**
	 * Header key of the session ID.
	 */
	public static final String HEADER_SESSION_ID = "X-TaskWall-Session";

	public static final int STATUS_PRECONDITION_FAILED = 400;

	public static final int STATUS_NO_SESSION = 403;

}
