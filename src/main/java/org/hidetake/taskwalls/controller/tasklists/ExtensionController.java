package org.hidetake.taskwalls.controller.tasklists;

import org.hidetake.taskwalls.controller.ControllerBase;
import org.hidetake.taskwalls.meta.TasklistExtensionMeta;
import org.hidetake.taskwalls.model.TasklistExtension;
import org.hidetake.taskwalls.service.TasklistExtensionService;
import org.slim3.controller.validator.Validators;

import com.google.api.client.json.GenericJson;

/**
 * Represents task list extension.
 * 
 * @author hidetake.org
 */
public class ExtensionController extends ControllerBase {

	@Override
	public GenericJson put() throws Exception {
		if (!validate()) {
			return preconditionFailed(errors.toString());
		}

		TasklistExtensionMeta m = TasklistExtensionMeta.get();
		TasklistExtension tasklistExtension = new TasklistExtension();
		tasklistExtension.setKey(TasklistExtension.createKey(param("tasklistID")));
		tasklistExtension.setColorCode(asInteger(m.colorCode));
		TasklistExtensionService.put(tasklistExtension);
		return null;
	}

	private boolean validate() {
		TasklistExtensionMeta m = TasklistExtensionMeta.get();
		Validators v = new Validators(request);
		v.add("tasklistID", v.required());
		v.add(m.colorCode, v.required(), v.integerType());
		return v.validate();
	}

}
