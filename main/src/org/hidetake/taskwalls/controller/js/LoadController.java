package org.hidetake.taskwalls.controller.js;

import java.io.File;
import java.io.FilenameFilter;
import java.io.PrintWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;
import org.slim3.util.DateUtil;
import org.slim3.util.LongUtil;

import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.JSSourceFile;
import com.google.javascript.jscomp.Result;

/**
 * Load scripts (development only).
 * 
 * @author hidetake.org
 */
public class LoadController extends Controller {

	private static final String JS_LIB = "js/lib";
	private static final String JS_SRC = "js/src";
	private static final String JSCOMP_OUTPUT = "js/min.js";
	private static final Logger logger = Logger.getLogger(LoadController.class.getName());

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
		// include scripts
		PrintWriter writer = response.getWriter();
		for (File file : findJavaScriptFiles(JS_LIB, JS_SRC)) {
			writer.append("document.write('<script type=\"text/javascript\" src=\"");
			writer.append(file.getPath());
			writer.append("\"></script>');");
		}

		// check for modification
		List<File> sources = findJavaScriptFiles(JS_SRC);
		List<Long> sourcesLastModified = new ArrayList<Long>(sources.size());
		for (File file : sources) {
			sourcesLastModified.add(file.lastModified());
		}
		long lastModified = Collections.max(sourcesLastModified);
		long since = LongUtil.toPrimitiveLong(Memcache.get(LoadController.class.getName()));
		Memcache.put(LoadController.class.getName(), lastModified);

		// compile sources
		if (since < lastModified) {
			String compiled = compile(sources);
			Writer fileWriter = (Writer) Class.forName("java.io.FileWriter")
					.getConstructor(String.class)
					.newInstance(JSCOMP_OUTPUT);
			fileWriter.append(compiled);
			fileWriter.close();
			logger.warning("Compiled source has been saved to " + JSCOMP_OUTPUT
					+ " (Last-modified: "
					+ DateUtil.toString(new Date(lastModified), DateUtil.ISO_DATE_TIME_PATTERN)
					+ ")");
		}
	}

	/**
	 * Finds JavaScript files under directories.
	 * 
	 * @param directories
	 * @return list of files
	 */
	private static List<File> findJavaScriptFiles(String... directories) {
		FilenameFilter filter = new FilenameFilter() {
			@Override
			public boolean accept(File dir, String name) {
				return name.endsWith(".js");
			}
		};
		List<File> result = new ArrayList<File>();
		for (String directory : directories) {
			File[] files = new File(directory).listFiles(filter);
			if (files != null) {
				result.addAll(Arrays.asList(files));
			}
		}
		return result;
	}

	/**
	 * Compiles JavaScript sources.
	 * 
	 * @param scripts
	 * @return
	 */
	private static String compile(List<File> scripts) {
		List<JSSourceFile> externs = new ArrayList<JSSourceFile>();
		List<JSSourceFile> sources = new ArrayList<JSSourceFile>();
		for (File file : scripts) {
			sources.add(JSSourceFile.fromFile(file));
		}

		Compiler compiler = new Compiler(System.err);
		compiler.disableThreads();
		CompilerOptions options = new CompilerOptions();
		Result result = compiler.compile(externs, sources, options);
		if (!result.success) {
			throw new RuntimeException("Closure Compiler returned error");
		}
		return compiler.toSource();
	}

}
