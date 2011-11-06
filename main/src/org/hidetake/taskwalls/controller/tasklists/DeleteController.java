package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

public class DeleteController extends ControllerBase
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

		tasksService.tasklists.delete(asString("id")).execute();
		return null;
	}

	private boolean validate()
	{
		Validators v = new Validators(request);
		v.add("id", v.required());
		return v.validate();
	}

}
