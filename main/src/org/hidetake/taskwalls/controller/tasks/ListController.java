package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.hidetake.taskwalls.util.JsonCache;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

import com.google.api.client.util.DateTime;
import com.google.api.services.tasks.model.Task;
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
		cache.productionPolicy.setExpiration(Expiration.byDeltaSeconds(10));
		if (!AjaxPreconditions.isXHR(request)) {
			return null;
		}
		if (!validate()) {
			return forwardInvalidRequest();
		}
		String tasklistID = asString("tasklistID");

		JsonCache.Entry entry = cache.keys(getClass(), sessionKey, tasklistID);
		Tasks tasks = entry.get(Tasks.class);
		if (tasks == null) {
			tasks = taskService.tasks.list(tasklistID).execute();
			entry.put(tasks);
		}

		// TODO: move to model?
		for (Task task : tasks.getItems()) {
			DateTime due = task.getDue();
			if (due != null) {
				task.put("dueTime", due.getValue());
			}

			String[] uriParts = task.getSelfLink().split("/");
			if (uriParts.length > 3) {
				task.put("tasklistID", uriParts[uriParts.length - 3]);
			}
			else {
				// fall back (usually not happen)
				task.put("tasklistID", tasklistID);
			}
		}

		return jsonResponse(tasks);
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		return v.validate();
	}

}
