package org.hidetake.taskwalls.controller.tasks.update;

import java.util.Date;
import java.util.TimeZone;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.model.TaskExtension;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;
import org.slim3.util.DateUtil;
import org.slim3.util.TimeZoneLocator;

import com.google.api.client.util.DateTime;
import com.google.api.services.tasks.Tasks.TasksOperations.Patch;
import com.google.api.services.tasks.model.Task;

/**
 * Updates task due time.
 * @author hidetake.org
 */
public class DueTimeController extends ControllerBase
{

	@Override
	public Navigation run() throws Exception
	{
		if (!isPost()) {
			return forward("/errors/preconditionFailed");
		}
		if (!AjaxPreconditions.isXHR(request)) {
			return forward("/errors/preconditionFailed");
		}
		if (!validate()) {
			return forward("/errors/preconditionFailed");
		}

		TimeZoneLocator.set(TimeZone.getTimeZone("UTC"));
		Date due = DateUtil.clearTimePart(new Date(asLong("dueTime")));

		Task task = new Task();
		task.setId(asString("id"));
		task.setDue(new DateTime(due, TimeZoneLocator.get()));

		Patch patch = tasksService.tasks.patch(asString("tasklistID"), task.getId(), task);
		Task patched = patch.execute();

		TaskExtension.extend(patched);

		return jsonResponse(patched);
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		v.add("id", v.required());
		v.add("dueTime", v.required(), v.longType());
		return v.validate();
	}
}
