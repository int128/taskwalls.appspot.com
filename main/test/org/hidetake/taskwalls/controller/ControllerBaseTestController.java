package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.util.googleapis.JacksonFactoryLocator;
import org.slim3.controller.Navigation;

import com.google.api.client.json.GenericJson;

public class ControllerBaseTestController extends ControllerBase {

	@Override
	protected Navigation run() throws Exception {
		if (asBoolean("json") == null) {
			return null;
		}
		else {
			GenericJson json = new GenericJson();
			json.setFactory(JacksonFactoryLocator.get());
			return jsonResponse(json);
		}
	}

}
