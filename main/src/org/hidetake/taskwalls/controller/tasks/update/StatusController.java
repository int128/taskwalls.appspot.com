package org.hidetake.taskwalls.controller.tasks.update;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;
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

	@Override
	public Navigation run() throws Exception
	{
		if (!AjaxPreconditions.isXHR(request)) {
			return null;
		}
		if (!validate()) {
			response.sendError(400);
			return null;
		}

		Task task = new Task();
		task.setId(asString("id"));
		task.setStatus(asString("status"));

		Patch patch = taskService.tasks.patch(asString("tasklistID"), task.getId(), task);
		task = patch.execute();

		// TODO: move to model?
		DateTime due = task.getDue();
		if (due != null) {
			task.put("dueTime", due.getValue());
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
