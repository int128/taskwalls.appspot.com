package org.hidetake.taskwalls.controller.js;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

/**
 * Load scripts (development only).
 * @author hidetake.org
 */
public class LoadController extends Controller
{

	@Override
	public Navigation run() throws Exception
	{
		response.setCharacterEncoding("UTF-8");
		response.setContentType("text/javascript");
		if (isDevelopment()) {
			load("js/lib");
			load("js/src");
		}
		response.flushBuffer();
		return null;
	}

	private void load(String directory) throws IOException
	{
		PrintWriter writer = response.getWriter();
		for (File file : new File(directory).listFiles()) {
			writer.append("document.write('<script type=\"text/javascript\" src=\"");
			writer.append(file.getPath());
			writer.append("\"></script>');");
		}
	}

}
