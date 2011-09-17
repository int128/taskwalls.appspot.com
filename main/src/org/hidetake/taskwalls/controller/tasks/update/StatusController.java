package org.hidetake.taskwalls.controller.tasks.update;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

import com.google.api.client.util.DateTime;
import com.google.api.services.tasks.Tasks.TasksOperations.Patch;
import com.google.api.services.tasks.model.Task;

/**
 * Update task status.
 * @author hidetake.org
 */
public class StatusController extends ControllerBase
{

	private static final Pattern PATTERN_TAGS = Pattern.compile("(?:\\[(.+?)\\])+(.*)");

	@Override
	public Navigation run() throws Exception
	{
		if (!validate()) {
			response.sendError(400, errors.toString());
			return null;
		}

		Task task = new Task();
		task.setId(asString("id"));
		task.setStatus(asString("status"));

		Patch patch = taskService.tasks.patch(asString("tasklistID"), task.getId(), task);
		task = patch.execute();

		// FIXME: タスクが壊れる！
		// FIXME: dirty code!!
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
		}

		return jsonResponse(task);
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("status", v.required(), v.regexp("needsAction|completed"));
		v.add("tasklistID", v.required());
		v.add("id", v.required());
		return v.validate();
	}

}
