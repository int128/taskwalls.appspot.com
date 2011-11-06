package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

import com.google.api.services.tasks.model.TaskList;

public class CreateController extends ControllerBase
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

		TaskList taskList = new TaskList();
		taskList.setId(asString("id"));
		taskList.setTitle(asString("title"));
		TaskList created = tasksService.tasklists.insert(taskList).execute();
		return jsonResponse(created);
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("title", v.required());
		return v.validate();
	}

}
