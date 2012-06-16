package org.hidetake.taskwalls.controller.assets;

import java.io.File;
import java.io.PrintWriter;

import org.apache.commons.io.FileUtils;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

/**
 * Load stylesheets (development only).
 * 
 * @author hidetake.org
 */
public class CssController extends Controller {

	private static final String CONF_PATH = "/WEB-INF/assets.css.conf";

	@Override
	public Navigation run() throws Exception {
		response.setCharacterEncoding("UTF-8");
		response.setContentType("text/css");
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
			writer.append("@import url('");
			writer.append(line);
			writer.append("');");
			writer.println();
		}
	}

}
