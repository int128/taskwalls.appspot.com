package org.hidetake.lab.controller.tasks;

import java.util.logging.Logger;

import org.hidetake.lab.service.oauth2.CachedToken;
import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;
import org.slim3.util.AppEngineUtil;

/**
 * Cleanup Memcache entries except token.
 * @author hidetake.org
 */
public class CleancacheController extends ControllerBase
{

	private static final Logger logger = Logger.getLogger(CleancacheController.class.getName());

	@Override
	public Navigation run() throws Exception
	{
		if (AppEngineUtil.isProduction()) {
			logger.warning("not allowed on production server");
		}
		else {
			CachedToken token = Memcache.get(sessionKey);
			Memcache.cleanAll();
			Memcache.put(sessionKey, token);
		}
		return null;
	}

}
