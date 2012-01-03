package org.hidetake.taskwalls.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Message digest generator.
 * 
 * @author hidetake.org
 */
public class DigestGenerator {

	private final MessageDigest digest;

	private DigestGenerator(MessageDigest digest) {
		this.digest = digest;
	}

	/**
	 * Creates an instance by default algorithm (SHA-256).
	 * 
	 * @return
	 * @throws NoSuchAlgorithmException
	 */
	public static DigestGenerator create() throws NoSuchAlgorithmException {
		return new DigestGenerator(MessageDigest.getInstance("SHA-256"));
	}

	/**
	 * Creates an instance by specified algorithm.
	 * 
	 * @param algorithm
	 * @return
	 * @throws NoSuchAlgorithmException
	 */
	public static DigestGenerator create(String algorithm) throws NoSuchAlgorithmException {
		return new DigestGenerator(MessageDigest.getInstance(algorithm));
	}

	/**
	 * Resets the digest.
	 * 
	 * @see java.security.MessageDigest#reset()
	 */
	public void reset() {
		digest.reset();
	}

	/**
	 * Updates the digest.
	 * 
	 * @param factors uniqueness factors (skipped if null)
	 * @return this
	 */
	public DigestGenerator update(Object... factors) {
		for (Object factor : factors) {
			if (factor != null) {
				digest.update(factor.toString().getBytes());
			}
		}
		return this;
	}

	/**
	 * Computes the digest and resets.
	 * 
	 * @return
	 */
	public String getAsHexString() {
		StringBuilder builder = new StringBuilder();
		for (byte b : digest.digest()) {
			builder.append(Integer.toHexString(b & 0xff));
		}
		return builder.toString();
	}

}
