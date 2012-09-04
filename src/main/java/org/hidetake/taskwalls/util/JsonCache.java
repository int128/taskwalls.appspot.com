package org.hidetake.taskwalls.util;

import java.io.IOException;
import java.io.Serializable;

import org.hidetake.taskwalls.util.googleapis.JsonFactoryLocator;
import org.slim3.memcache.Memcache;
import org.slim3.util.AppEngineUtil;

import com.google.api.client.json.GenericJson;
import com.google.appengine.api.memcache.Expiration;

/**
 * Memcache manager to handle {@link GenericJson} objects.
 * 
 * @author hidetake.org
 */
public class JsonCache {

	/**
	 * Cache policy.
	 */
	public static class Policy {
		private Expiration expiration = null;

		/**
		 * Set {@link Expiration}, default is null.
		 * 
		 * @param expiration
		 */
		public void setExpiration(Expiration expiration) {
			this.expiration = expiration;
		}
	}

	/**
	 * Cache entry.
	 */
	public class Entry {
		private final Serializable[] keys;

		public Entry(Serializable[] keys) {
			this.keys = keys;
		}

		/**
		 * Get object from cache.
		 * 
		 * @param clazz
		 * @return
		 * @throws IOException
		 */
		public <V extends GenericJson> V get(Class<V> clazz) throws IOException {
			return JsonCache.this.get(keys, clazz);
		}

		/**
		 * Put object into cache as JSON string.
		 * 
		 * @param value object
		 */
		public <V extends GenericJson> void put(V value) {
			JsonCache.this.put(keys, value);
		}
	}

	/**
	 * Cache policy for development environment.
	 */
	public final Policy developmentPolicy = new Policy();

	/**
	 * Cache policy for production environment.
	 */
	public final Policy productionPolicy = new Policy();

	/**
	 * Cache policy for current environment.
	 */
	protected final Policy currentPolicy =
			AppEngineUtil.isProduction() ? productionPolicy : developmentPolicy;

	/**
	 * Get object from cache.
	 * 
	 * @param key
	 * @param clazz
	 * @return
	 * @throws IOException
	 */
	public <K extends Serializable, V extends GenericJson> V get(K key, Class<V> clazz)
			throws IOException {
		String json = Memcache.get(key);
		if (json == null) {
			return null;
		}
		return JsonFactoryLocator.get().createJsonParser(json).parse(clazz, null);
	}

	/**
	 * Put object into cache as JSON string.
	 * 
	 * @param key cache key
	 * @param value object
	 */
	public <K extends Serializable, V extends GenericJson> void put(K key, V value) {
		if (key == null) {
			throw new NullPointerException("key is null");
		}
		if (value == null) {
			throw new NullPointerException("value is null");
		}
		String json = value.toString();
		Memcache.put(key, json, currentPolicy.expiration);
	}

	/**
	 * Returns {@link Entry}.
	 * 
	 * @param keys cache keys
	 * @return
	 */
	public Entry keys(Serializable... keys) {
		return new Entry(keys);
	}

}
