package org.hidetake.taskwalls.controller.assets;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;

import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

public class FileControllerTest extends ControllerTestCase {

	@Test
	public void js() throws Exception {
		tester.servletContext.addRealPath("/", "./webapp/");
		tester.param("type", "javascript");
		tester.param("path", "app.js");
		tester.start("/assets/file");
		FileController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(200));
		assertThat(tester.response.getContentType(), is("text/javascript"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
	}

	@Test
	public void css() throws Exception {
		tester.servletContext.addRealPath("/", "./webapp/");
		tester.param("type", "css");
		tester.param("path", "app.css");
		tester.start("/assets/file");
		FileController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(200));
		assertThat(tester.response.getContentType(), is("text/css"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
	}

}
