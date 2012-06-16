package org.hidetake.taskwalls.controller.assets;

import org.slim3.tester.ControllerTestCase;
import org.hidetake.taskwalls.controller.assets.JsController;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

public class JsControllerTest extends ControllerTestCase {

	@Test
	public void run() throws Exception {
		tester.start("/assets/js");
		JsController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getContentType(), is("text/javascript"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
		assertThat(tester.response.getStatus(), is(200));
	}

}
