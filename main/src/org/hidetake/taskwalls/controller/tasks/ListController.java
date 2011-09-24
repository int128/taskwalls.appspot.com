package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.model.TaskExtension;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.hidetake.taskwalls.util.JsonCache;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

import com.google.api.services.tasks.model.Tasks;
import com.google.appengine.api.memcache.Expiration;

/**
 * Get tasks.
 * @author hidetake.org
 */
public class ListController extends ControllerBase
{

	private final JsonCache cache = new JsonCache();

	@Override
	public Navigation run() throws Exception
	{
		if (!isGet()) {
			return forward("/errors/preconditionFailed");
		}
		if (!AjaxPreconditions.isXHR(request)) {
			return forward("/errors/preconditionFailed");
		}
		if (!validate()) {
			return forward("/errors/preconditionFailed");
		}

		cache.productionPolicy.setExpiration(Expiration.byDeltaSeconds(10));

		String tasklistID = asString("tasklistID");
		JsonCache.Entry entry = cache.keys(getClass(), sessionKey, tasklistID);
		Tasks tasks = entry.get(Tasks.class);
		if (tasks == null) {
			tasks = tasksService.tasks.list(tasklistID).execute();
			entry.put(tasks);
		}

		TaskExtension.extend(tasks);

		return jsonResponse(tasks);
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		return v.validate();
	}

}
