package org.hidetake.taskwalls.controller;

import static org.hamcrest.CoreMatchers.*;
import static org.hidetake.taskwalls.controller.RequestTestUtil.*;
import static org.junit.Assert.*;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.UUID;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.hidetake.taskwalls.Constants;
import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

import com.google.api.client.json.GenericJson;

public class ControllerBaseTest extends ControllerTestCase {

	@Test
	public void notXHR() throws Exception {
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void noSessionHeader() throws Exception {
		setXHR(tester);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void invalidHeader() throws Exception {
		setXHR(tester);
		String sessionID = UUID.randomUUID().toString();
		tester.request.setHeader(Constants.HEADER_SESSION, sessionID);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(Constants.STATUS_PRECONDITION_FAILED));
	}

	@Test
	public void get() throws Exception {
		setXHR(tester);
		enableSession(tester);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(controller.get, is(1));
	}

	@Test
	public void post() throws Exception {
		setXHR(tester);
		setMethodAsPost(tester);
		enableSession(tester);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(controller.post, is(1));
	}

	@Test
	public void put() throws Exception {
		setXHR(tester);
		setMethodAsPut(tester);
		enableSession(tester);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(controller.put, is(1));
	}

	@Test
	public void delete() throws Exception {
		setXHR(tester);
		setMethodAsDelete(tester);
		enableSession(tester);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(controller.delete, is(1));
	}

	@Test
	public void jsonGiven() throws Exception {
		setXHR(tester);
		enableSession(tester);
		tester.request.setCharacterEncoding("UTF-8");
		tester.request.setContentType("application/json; Charset=UTF-8");
		tester.request.setReader(IOUtils.toBufferedReader(
				new InputStreamReader(IOUtils.toInputStream(
						"{\"title\":\"hogehoge\",\"id\":1}"))));
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));

		GenericJson json = controller.parseJsonAs(GenericJson.class);
		assertThat(json, is(notNullValue()));
		assertThat((String) json.get("title"), is("hogehoge"));
		assertThat((BigDecimal) json.get("id"), is(new BigDecimal(1)));
	}

	@Test
	public void jsonResponse() throws Exception {
		setXHR(tester);
		enableSession(tester);
		tester.param("json", true);
		tester.start("/controllerBaseTest");
		ControllerBaseTestController controller = tester.getController();
		assertThat(controller, is(notNullValue()));
		assertThat(tester.isRedirect(), is(false));
		assertThat(tester.getDestinationPath(), is(nullValue()));
		assertThat(tester.response.getStatus(), is(HttpServletResponse.SC_OK));
		assertThat(tester.response.getHeader("X-Content-Type-Options"), is("nosniff"));
		assertThat(tester.response.getContentType(), is("application/json"));
		assertThat(tester.response.getCharacterEncoding(), is("UTF-8"));
	}

}