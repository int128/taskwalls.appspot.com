package org.hidetake.taskwalls.controller.js;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.memcache.Memcache;

import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.JSSourceFile;
import com.google.javascript.jscomp.Result;

/**
 * Load scripts (development only).
 * @author hidetake.org
 */
public class LoadController extends Controller
{

	private static final String JS_LIB = "js/lib";
	private static final String JS_SRC = "js/src";
	private static final String JSCOMP_OUTPUT = "js/min.js";
	private static final Logger logger = Logger.getLogger(LoadController.class.getName());

	@Override
	public Navigation run() throws Exception
	{
		response.setCharacterEncoding("UTF-8");
		response.setContentType("text/javascript");
		if (isDevelopment()) {
			load(JS_LIB);
			load(JS_SRC);
			compile();
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

	private void compile() throws Exception
	{
		List<JSSourceFile> sources = new ArrayList<JSSourceFile>();
		long modified = Long.MIN_VALUE;
		for (File file : new File(JS_SRC).listFiles()) {
			long modifiedThis = file.lastModified();
			if (modified > modifiedThis) {
				modified = modifiedThis;
			}
			sources.add(JSSourceFile.fromFile(file));
		}

		Long previousModified = Memcache.get(LoadController.class.getName());
		if (previousModified != null && previousModified.longValue() == modified) {
			// not modified
			return;
		}
		Memcache.put(LoadController.class.getName(), modified);

		// compile
		Compiler compiler = new Compiler(System.err);
		compiler.disableThreads();
		CompilerOptions options = new CompilerOptions();
		Result result = compiler.compile(
				new JSSourceFile[0],
				sources.toArray(new JSSourceFile[0]),
				options);
		if (!result.success) {
			throw new RuntimeException("Closure Compiler returned error");
		}

		// write to min.js
		Writer fileWriter = (Writer) Class.forName("java.io.FileWriter")
				.getConstructor(String.class)
				.newInstance(JSCOMP_OUTPUT);
		fileWriter.append(compiler.toSource());
		fileWriter.close();

		logger.warning("Closure Compiler result saved: " + JSCOMP_OUTPUT);
	}

}
