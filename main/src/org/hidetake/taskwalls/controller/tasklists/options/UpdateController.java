package org.hidetake.taskwalls.controller.tasklists.options;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.meta.TasklistOptionsMeta;
import org.hidetake.taskwalls.model.TasklistOptions;
import org.hidetake.taskwalls.service.TasklistOptionsService;
import org.hidetake.taskwalls.util.AjaxPreconditions;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;

/**
 * Updates the tasklist options.
 * @author hidetake.org
 */
public class UpdateController extends ControllerBase
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

		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		TasklistOptions tasklistOptions = new TasklistOptions();
		tasklistOptions.setKey(TasklistOptions.createKey(asString("id")));
		tasklistOptions.setColorID(asInteger(m.colorID));
		TasklistOptionsService.put(tasklistOptions);
		return null;
	}

	private boolean validate()
	{
		TasklistOptionsMeta m = TasklistOptionsMeta.get();
		Validators v = new Validators(request);
		v.add("id", v.required());
		v.add(m.colorID, v.required(), v.integerType());
		return v.validate();
	}

}
