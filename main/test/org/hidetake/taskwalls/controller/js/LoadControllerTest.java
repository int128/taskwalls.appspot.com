package org.hidetake.taskwalls.controller.js;

import org.slim3.tester.ControllerTestCase;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

public class LoadControllerTest extends ControllerTestCase {

	@Test
	public void run() throws Exception {
		tester.start("/js/load");
		LoadController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getContentType(), is("text/javascript"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
		assertThat(tester.response.getStatus(), is(200));
	}

}
