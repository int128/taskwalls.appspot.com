package org.hidetake.taskwalls.tools.deployment;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.SequenceInputStream;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

import org.apache.commons.io.FileUtils;
import org.mozilla.javascript.ErrorReporter;

import com.yahoo.platform.yui.compressor.CssCompressor;
import com.yahoo.platform.yui.compressor.JavaScriptCompressor;

/**
 * Compress application assets.
 * 
 * @author hidetake.org
 */
public class CompressAssets {

	private static final String WEBAPP_BASE = "webapp/";
	private static final String ASSETS_CONF_CSS = "webapp/WEB-INF/assets.css.conf";
	private static final String ASSETS_CONF_JS = "webapp/WEB-INF/assets.js.conf";
	private static final String DESTINATION_CSS = "webapp/min.css";
	private static final String DESTINATION_JS = "webapp/min.js";

	private static final Logger logger = Logger.getLogger(CompressAssets.class.getName());

	public static void main(String[] args) throws Exception {
		compressCss();
		compressJs();
	}

	/**
	 * Compress CSS sources.
	 */
	private static void compressCss() throws Exception {
		OutputStream destination = FileUtils.openOutputStream(new File(DESTINATION_CSS));
		try {
			List<File> sources = new ArrayList<File>();
			File conf = new File(ASSETS_CONF_CSS);
			for (String line : FileUtils.readLines(conf)) {
				sources.add(new File(WEBAPP_BASE + line));
			}
			Writer writer = new BufferedWriter(new OutputStreamWriter(destination));
			for (File file : sources) {
				logger.info(String.format("Compressing %s (%,d bytes)", file.getName(), file.length()));
				new CssCompressor(new FileReader(file)).compress(writer, -1);
			}
			writer.close();
		} finally {
			destination.close();
		}
	}

	/**
	 * Compress JavaScript sources.
	 */
	private static void compressJs() throws Exception {
		OutputStream destination = FileUtils.openOutputStream(new File(DESTINATION_JS));
		try {
			List<File> sources = new ArrayList<File>();

			File conf = new File(ASSETS_CONF_JS);
			for (String line : FileUtils.readLines(conf)) {
				sources.add(new File(WEBAPP_BASE + line));
			}

			int sourceStreamsSize = 0;
			List<InputStream> sourceStreams = new ArrayList<InputStream>();
			sourceStreams.add(CompressAssets.class.getResourceAsStream("compress-header"));
			for (File file : sources) {
				if (file.getName().endsWith(".min.js")) {
					logger.info(String.format("Copying %s (%,d bytes)", file.getName(), file.length()));
					FileUtils.copyFile(file, destination);
				} else {
					sourceStreams.add(FileUtils.openInputStream(file));
					sourceStreamsSize += file.length();
				}
			}
			sourceStreams.add(CompressAssets.class.getResourceAsStream("compress-footer"));

			logger.info(String.format("Compressing (%,d bytes)", sourceStreamsSize));
			SequenceInputStream sourceStream = new SequenceInputStream(Collections.enumeration(sourceStreams));
			try {
				// compress
				ErrorReporter errorReporter = new YUICompressorErrorReporter();
				Writer writer = new BufferedWriter(new OutputStreamWriter(destination));
				new JavaScriptCompressor(new InputStreamReader(sourceStream), errorReporter).compress(
						writer, -1, true, true, false, false);
				writer.flush();
			} finally {
				sourceStream.close();
			}
		} finally {
			destination.close();
		}
	}

}
