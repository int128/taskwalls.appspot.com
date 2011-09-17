package org.hidetake.taskwalls.controller.tasks;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.hidetake.taskwalls.controller.ControllerBase;
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

	private static final Pattern PATTERN_TAGS = Pattern.compile("(?:\\[(.+?)\\])+(.*)");
	private final JsonCache cache = new JsonCache();

	@Override
	public Navigation run() throws Exception
	{
		cache.productionPolicy.setExpiration(Expiration.byDeltaSeconds(10));

		if (!validate()) {
			response.sendError(400);
			return null;
		}
		String tasklistID = asString("tasklistID");

		JsonCache.Entry entry = cache.keys(getClass(), sessionKey, tasklistID);
		Tasks tasks = entry.get(Tasks.class);
		if (tasks == null) {
			tasks = taskService.tasks.list(tasklistID).execute();
			entry.put(tasks);
		}

		// TODO: move to model?
		Set<String> tagset = new HashSet<String>();
		for (Task task : tasks.getItems()) {
			DateTime due = task.getDue();
			if (due != null) {
				task.put("dueTime", due.getValue());
			}

			String title = task.getTitle();
			if (title != null) {
				List<String> tags = new ArrayList<String>();
				Matcher m = PATTERN_TAGS.matcher(title);
				if (m.matches()) {
					int tagCount = m.groupCount();
					task.setTitle(m.group(tagCount));
					for (int i = 1; i < tagCount; i++) {
						tags.add(m.group(i));
					}
				}

				task.put("tags", tags);
				tagset.addAll(tags);
			}

			task.put("tasklistID", tasklistID);
		}
		tasks.put("tags", tagset);

		return jsonResponse(tasks);
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		return v.validate();
	}

}
