package org.hidetake.taskwalls.controller.assets;

import java.io.File;
import java.io.PrintWriter;
import java.util.Date;

import org.apache.commons.io.FileUtils;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

/**
 * Load assets.
 * 
 * @author hidetake.org
 */
public class IndexController extends Controller {

	private static final String ASSETS_CONF_CSS = "/WEB-INF/assets.css.conf";
	private static final String ASSETS_CONF_JS = "/WEB-INF/assets.js.conf";

	private static final String TEMPLATE_CSS =
			"document.write('<link rel=\"stylesheet\" href=\"/assets/file?type=css&path=%s\"/>');\n";
	private static final String TEMPLATE_JS =
			"document.write('<script src=\"/assets/file?type=javascript&path=%s\"></script>');\n";

	@Override
	public Navigation run() throws Exception {
		if (isDevelopment()) {
			response.setCharacterEncoding("UTF-8");
			response.setContentType("text/javascript");
			writeAssets();
			response.flushBuffer();
		} else {
			response.sendError(404);
		}
		return null;
	}

	private void writeAssets() throws Exception {
		PrintWriter writer = response.getWriter();
		writer.append(String.format("// %s\n", new Date()));
		for (String line : FileUtils.readLines(new File(servletContext.getRealPath(ASSETS_CONF_CSS)))) {
			writer.append(String.format(TEMPLATE_CSS, line));
		}
		for (String line : FileUtils.readLines(new File(servletContext.getRealPath(ASSETS_CONF_JS)))) {
			writer.append(String.format(TEMPLATE_JS, line));
		}
	}

}
