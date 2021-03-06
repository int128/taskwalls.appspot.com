package org.hidetake.taskwalls.controller.assets;

import java.io.File;
import java.io.PrintWriter;
import java.util.Date;

import org.apache.commons.io.FileUtils;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.util.AppEngineUtil;

/**
 * Load assets.
 * 
 * @author hidetake.org
 */
public class IndexController extends Controller {

	private static final String TEMPLATE_CSS =
			"document.write('<link rel=\"stylesheet\" href=\"/assets/file?type=css&path=%s\"/>');\n";
	private static final String TEMPLATE_JS =
			"document.write('<script src=\"/assets/file?type=javascript&path=%s\"></script>');\n";

	@Override
	public Navigation run() throws Exception {
		if (!AppEngineUtil.isProduction()) {
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
		File projectBase = new File(servletContext.getRealPath("/")).getParentFile();
		File cssBase = new File(projectBase, Constants.SOURCE_CSS);
		File jsBase = new File(projectBase, Constants.SOURCE_JS);

		PrintWriter writer = response.getWriter();
		writer.append(String.format("// %s\n", new Date()));
		for (String line : FileUtils.readLines(new File(cssBase, "/assets.conf"))) {
			writer.append(String.format(TEMPLATE_CSS, line));
		}
		for (String line : FileUtils.readLines(new File(jsBase, "/assets.conf"))) {
			writer.append(String.format(TEMPLATE_JS, line));
		}
	}

}
