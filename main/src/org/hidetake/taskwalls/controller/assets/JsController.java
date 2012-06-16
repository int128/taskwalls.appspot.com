package org.hidetake.taskwalls.controller.assets;

import java.io.File;
import java.io.PrintWriter;

import org.apache.commons.io.FileUtils;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

/**
 * Load scripts (development only).
 * 
 * @author hidetake.org
 */
public class JsController extends Controller {

	private static final String CONF_PATH = "/WEB-INF/assets.js.conf";

	@Override
	public Navigation run() throws Exception {
		response.setCharacterEncoding("UTF-8");
		response.setContentType("text/javascript");
		if (isDevelopment()) {
			runOnDevelopment();
		}
		response.flushBuffer();
		return null;
	}

	protected void runOnDevelopment() throws Exception {
		File conf = new File(servletContext.getRealPath(CONF_PATH));
		PrintWriter writer = response.getWriter();
		for (String line : FileUtils.readLines(conf)) {
			writer.append("document.write('<script src=\"");
			writer.append(line);
			writer.append("\"></script>');");
			writer.println();
		}
	}

}
