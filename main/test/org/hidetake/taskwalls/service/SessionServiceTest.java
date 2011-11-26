package org.hidetake.taskwalls.service;

import java.util.Date;
import java.util.concurrent.Future;

import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.model.oauth2.CachedToken;
import org.junit.Test;
import org.slim3.memcache.Memcache;
import org.slim3.tester.AppEngineTestCase;

import com.google.appengine.api.datastore.Key;

import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*;

public class SessionServiceTest extends AppEngineTestCase
{

	@Test
	public void put() throws Exception
	{
		Session session = new Session();
		session.setKey(Session.createKey("hogeSession"));
		session.setToken(new CachedToken("accessToken", "refreshToken", new Date()));
		// wait for complete
		Future<Key> future = SessionService.put(session);
		future.get();
		assertThat(tester.count(Session.class), is(1));
	}

	@Test(expected = NullPointerException.class)
	public void putNull() throws Exception
	{
		SessionService.put(null);
	}

	@Test
	public void get() throws Exception
	{
		long now = System.currentTimeMillis();
		Session session = new Session();
		session.setKey(Session.createKey("hogeSession"));
		session.setToken(new CachedToken("at", "rt", new Date(now)));
		// wait for complete
		Future<Key> future = SessionService.put(session);
		future.get();
		Session stored = SessionService.get("hogeSession");
		assertThat(stored.getToken(), is(notNullValue()));
		assertThat(stored.getToken().getAccessToken(), is("at"));
		assertThat(stored.getToken().getRefreshToken(), is("rt"));
		assertThat(stored.getToken().getExpire().getTime(), is(now));
	}

	@Test
	public void getCacheExpires() throws Exception
	{
		long now = System.currentTimeMillis();
		Session session = new Session();
		session.setKey(Session.createKey("hogeSession"));
		session.setToken(new CachedToken("at", "rt", new Date(now)));
		// wait for complete
		Future<Key> future = SessionService.put(session);
		future.get();
		// expire
		Memcache.cleanAll();
		Session stored = SessionService.get("hogeSession");
		assertThat(stored.getToken(), is(notNullValue()));
		assertThat(stored.getToken().getAccessToken(), is("at"));
		assertThat(stored.getToken().getRefreshToken(), is("rt"));
		assertThat(stored.getToken().getExpire().getTime(), is(now));
	}

	@Test
	public void delete() throws Exception
	{
		Session session = new Session();
		session.setKey(Session.createKey("hogeSession"));
		session.setToken(new CachedToken("accessToken", "refreshToken", new Date()));
		// wait for complete
		Future<Key> future = SessionService.put(session);
		future.get();
		assertThat(tester.count(Session.class), is(1));
		assertThat(Memcache.statistics().getItemCount(), is(1L));
		SessionService.delete("hogeSession");
		assertThat(tester.count(Session.class), is(0));
		assertThat(Memcache.statistics().getItemCount(), is(0L));
	}

}
