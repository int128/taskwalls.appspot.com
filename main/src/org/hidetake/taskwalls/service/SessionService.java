package org.hidetake.taskwalls.service;

import java.util.concurrent.Future;

import org.hidetake.taskwalls.Constants;
import org.hidetake.taskwalls.meta.SessionMeta;
import org.hidetake.taskwalls.model.Session;
import org.slim3.datastore.Datastore;
import org.slim3.memcache.Memcache;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.memcache.Expiration;

/**
 * Service class for model {@link Session}.
 * @author hidetake.org
 */
public class SessionService
{

	private static final Expiration expiration =
			Expiration.byDeltaSeconds(Constants.sessionExpiration);

	private SessionService()
	{
	}

	/**
	 * Put the session into datastore.
	 * Session will be written asynchronously.
	 * @param session
	 * @return future key
	 */
	public static Future<Key> put(Session session)
	{
		if (session == null) {
			throw new NullPointerException("session is null");
		}
		Future<Key> key = Datastore.putAsync(session);
		Memcache.put(session.getKey(), session, expiration);
		return key;
	}

	/**
	 * Get the session from datastore.
	 * @param sessionID
	 * @return null if not found
	 */
	public static Session get(String sessionID)
	{
		if (sessionID == null) {
			throw new NullPointerException("sessionID is null");
		}
		Key key = Session.createKey(sessionID);
		Session cached = Memcache.get(key);
		if (cached != null) {
			return cached;
		}
		Session stored = Datastore.getOrNull(SessionMeta.get(), key);
		if (stored != null) {
			Memcache.put(stored.getKey(), stored, expiration);
		}
		return stored;
	}

}
