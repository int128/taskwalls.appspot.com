package org.hidetake.taskwalls.controller.tasks.update;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.model.TaskExtension;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

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

		Task task = new Task();
		task.setId(asString("id"));
		task.setDue(new DateTime(asLong("dueTime"), 0));
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
