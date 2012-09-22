package org.hidetake.taskwalls.controller;

import com.google.api.client.json.GenericJson;

public class ControllerBaseTestController extends ControllerBase {

	@Override
	protected GenericJson response() throws Exception {
		if (asBoolean("json") == null) {
			return null;
		} else {
			return new GenericJson();
		}
	}

}
