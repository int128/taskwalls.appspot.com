package org.hidetake.taskwalls.controller.tasks.update;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.model.TaskExtension;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

import com.google.api.services.tasks.Tasks.TasksOperations.Patch;
import com.google.api.services.tasks.model.Task;

/**
 * Update task status.
 * @author hidetake.org
 */
public class StatusController extends ControllerBase
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
		Patch patch = tasksService.tasks.patch(asString("tasklistID"), task.getId(), task);
		if (asBoolean("statusIsCompleted")) {
			task.setStatus("completed");
		}
		else {
			task.setStatus("needsAction");
			// FIXME: not worked
			task.setCompleted(null);
		}
		Task patched = patch.execute();

		TaskExtension.extend(patched);

		return jsonResponse(patched);
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		v.add("id", v.required());
		v.add("statusIsCompleted", v.required(), v.regexp("true|false"));
		return v.validate();
	}
}
