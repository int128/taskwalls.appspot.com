package org.hidetake.taskwalls.controller.assets;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;

import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

public class IndexControllerTest extends ControllerTestCase {

	@Test
	public void test() throws Exception {
		tester.servletContext.addRealPath("/", "./webapp/");
		tester.start("/assets/");
		IndexController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(200));
		assertThat(tester.response.getContentType(), is("text/javascript"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
	}

}
