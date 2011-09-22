package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.meta.TasklistOptionsMeta;
import org.hidetake.taskwalls.model.TasklistOptions;
import org.hidetake.taskwalls.service.TasklistOptionsService;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.hidetake.taskwalls.util.JsonCache;
import org.slim3.controller.Navigation;

import com.google.api.services.tasks.model.TaskList;
import com.google.api.services.tasks.model.TaskLists;
import com.google.appengine.api.memcache.Expiration;

/**
 * Get tasklists.
 * @author hidetake.org
 */
public class ListController extends ControllerBase
{

	private final JsonCache cache = new JsonCache();

	@Override
	public Navigation run() throws Exception
	{
		cache.productionPolicy.setExpiration(Expiration.byDeltaSeconds(10));

		if (!isGet()) {
			return forward("/errors/preconditionFailed");
		}
		if (!AjaxPreconditions.isXHR(request)) {
			return forward("/errors/preconditionFailed");
		}

		JsonCache.Entry entry = cache.keys(getClass(), sessionKey);
		TaskLists taskLists = entry.get(TaskLists.class);
		if (taskLists == null) {
			taskLists = taskService.tasklists.list().execute();
			entry.put(taskLists);
		}

		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		for (TaskList taskList : taskLists.getItems()) {
			TasklistOptions tasklistOptions = TasklistOptionsService.get(taskList.getId());
			if (tasklistOptions != null) {
				taskList.put(m.colorID.getName(), tasklistOptions.getColorID());
			}
		}
		return jsonResponse(taskLists);
	}

}
