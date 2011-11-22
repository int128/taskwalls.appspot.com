package org.hidetake.taskwalls.controller.tasks;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

import com.google.api.services.tasks.model.Tasks;

/**
 * Get tasks.
 * @author hidetake.org
 */
public class ListController extends ControllerBase
{

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

		String tasklistID = asString("tasklistID");
		Tasks tasks = tasksService.tasks.list(tasklistID).execute();
		return jsonResponse(tasks);
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		return v.validate();
	}

}
