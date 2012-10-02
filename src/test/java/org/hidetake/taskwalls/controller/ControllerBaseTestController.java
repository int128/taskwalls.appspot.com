package org.hidetake.taskwalls.controller;

import com.google.api.client.json.GenericJson;

public class ControllerBaseTestController extends ControllerBase {

	protected int get = 0;
	protected int post = 0;
	protected int put = 0;
	protected int delete = 0;

	@Override
	protected GenericJson get() throws Exception {
		get++;
		if (asBoolean("json") == null) {
			return null;
		} else {
			return new GenericJson();
		}
	}

	@Override
	protected GenericJson post() throws Exception {
		post++;
		return null;
	}

	@Override
	protected GenericJson put() throws Exception {
		put++;
		return null;
	}

	@Override
	protected GenericJson delete() throws Exception {
		delete++;
		return null;
	}

}
