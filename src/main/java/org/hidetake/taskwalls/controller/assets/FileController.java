package org.hidetake.taskwalls.controller.assets;

import java.io.File;
import java.io.FileInputStream;

import org.apache.commons.io.IOUtils;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.util.AppEngineUtil;

/**
 * Resource proxy.
 * 
 * @author hidetake.org
 */
public class FileController extends Controller {

	@Override
	public Navigation run() throws Exception {
		if (!AppEngineUtil.isProduction()) {
			response.setCharacterEncoding("UTF-8");
			response.setContentType("text/" + param("type"));
			File projectBase = new File(servletContext.getRealPath("/")).getParentFile();
			File sourceBase = new File(projectBase, Constants.SOURCE_BASE);
			File contentBase = new File(sourceBase, param("type"));
			File contentFile = new File(contentBase, param("path"));
			IOUtils.copy(new FileInputStream(contentFile), response.getOutputStream());
			response.flushBuffer();
		} else {
			response.sendError(404);
		}
		return null;
	}

}
