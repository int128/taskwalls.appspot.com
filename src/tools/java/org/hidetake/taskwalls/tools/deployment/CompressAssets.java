package org.hidetake.taskwalls.tools.deployment;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.SequenceInputStream;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.mozilla.javascript.ErrorReporter;

import com.googlecode.htmlcompressor.compressor.HtmlCompressor;
import com.yahoo.platform.yui.compressor.CssCompressor;
import com.yahoo.platform.yui.compressor.JavaScriptCompressor;

/**
 * Compress application assets.
 * 
 * @author hidetake.org
 */
public class CompressAssets {

	private static final File WEBAPP_BASE = new File("./webapp");
	private static final File JS_BASE = new File("./src/main/javascript");
	private static final File CSS_BASE = new File("./src/main/css");

	private static final File ASSETS_CONF_CSS = new File(WEBAPP_BASE, "/WEB-INF/assets.css.conf");
	private static final File ASSETS_CONF_JS = new File(WEBAPP_BASE, "/WEB-INF/assets.js.conf");
	private static final File ASSETS_HTML = new File(WEBAPP_BASE, "/source.html");

	private static final File OUTPUT_CSS = new File(WEBAPP_BASE, "/production.css");
	private static final File OUTPUT_JS = new File(WEBAPP_BASE, "/production.js");
	private static final File OUTPUT_HTML = new File(WEBAPP_BASE, "/production.html");

	private static final Logger logger = Logger.getLogger(CompressAssets.class.getName());

	public static void main(String[] args) throws Exception {
		compressHtml();
		compressCss();
		compressJs();
	}

	/**
	 * Compress HTML source(s).
	 */
	private static void compressHtml() throws Exception {
		HtmlCompressor compressor = new HtmlCompressor();
		compressor.setRemoveComments(false);
		compressor.setCompressCss(true);
		compressor.setCompressJavaScript(false);
		compressor.setRemoveIntertagSpaces(true);
		compressor.setYuiErrorReporter(new YUICompressorErrorReporter());

		String source = FileUtils.readFileToString(ASSETS_HTML);
		String result = compressor.compress(source);
		FileUtils.writeStringToFile(OUTPUT_HTML, result);

		logger.info(String.format("Compressed HTML (%,d bytes -> %,d bytes)",
				ASSETS_HTML.length(), OUTPUT_HTML.length()));
	}

	/**
	 * Compress CSS sources.
	 */
	private static void compressCss() throws Exception {
		List<File> sources = new ArrayList<File>();
		for (String line : FileUtils.readLines(ASSETS_CONF_CSS)) {
			sources.add(new File(CSS_BASE, line));
		}

		Writer writer = new FileWriter(OUTPUT_CSS);
		try {
			for (File source : sources) {
				logger.info(String.format("Compressing %s (%,d bytes)", source.getName(), source.length()));
				new CssCompressor(new FileReader(source)).compress(writer, -1);
			}
		} finally {
			IOUtils.closeQuietly(writer);
		}
	}

	/**
	 * Compress JavaScript sources.
	 */
	private static void compressJs() throws Exception {
		List<File> rawSourceFiles = new ArrayList<File>();
		List<File> compressingSourceFiles = new ArrayList<File>();
		for (String line : FileUtils.readLines(ASSETS_CONF_JS)) {
			if (line.endsWith(".min.js")) {
				rawSourceFiles.add(new File(JS_BASE, line));
			} else {
				compressingSourceFiles.add(new File(JS_BASE, line));
			}
		}

		List<InputStream> compressingSources = new ArrayList<InputStream>();
		compressingSources.add(CompressAssets.class.getResourceAsStream("compress-header"));
		for (File source : compressingSourceFiles) {
			compressingSources.add(new FileInputStream(source));
		}
		compressingSources.add(CompressAssets.class.getResourceAsStream("compress-footer"));

		Writer writer = new FileWriter(OUTPUT_JS);
		try {
			for (File source : rawSourceFiles) {
				IOUtils.copy(new FileReader(source), writer);
			}

			ErrorReporter errorReporter = new YUICompressorErrorReporter();
			InputStreamReader source = new InputStreamReader(
					new SequenceInputStream(Collections.enumeration(compressingSources)));
			try {
				JavaScriptCompressor compressor = new JavaScriptCompressor(source, errorReporter);
				compressor.compress(writer, -1, true, true, false, false);
			} finally {
				IOUtils.closeQuietly(source);
			}
		} finally {
			IOUtils.closeQuietly(writer);
		}
	}

}
