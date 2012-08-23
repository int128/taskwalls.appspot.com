package org.hidetake.taskwalls.controller;

import org.hidetake.taskwalls.util.googleapis.JacksonFactoryLocator;

import com.google.api.client.json.GenericJson;

public class ControllerBaseTestController extends ControllerBase {

	@Override
	protected boolean validate() {
		return true;
	}

	@Override
	protected GenericJson response() throws Exception {
		if (asBoolean("json") == null) {
			return null;
		} else {
			GenericJson json = new GenericJson();
			json.setFactory(JacksonFactoryLocator.get());
			return json;
		}
	}

}
