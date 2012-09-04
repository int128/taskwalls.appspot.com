package org.hidetake.taskwalls.service;

import java.io.IOException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.logging.Logger;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;
import org.hidetake.taskwalls.model.oauth2.ClientCredential;
import org.hidetake.taskwalls.util.DigestGenerator;
import org.hidetake.taskwalls.util.googleapis.JsonFactoryLocator;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;

/**
 * This class provides serialization and restoring an OAuth2 token.
 * 
 * @author hidetake.org
 */
public class SessionManager {

	private static final Logger logger = Logger.getLogger(SessionManager.class.getName());

	/**
	 * Serialize the {@link GoogleTokenResponse}.
	 * This method applies JSON serialization, encryption and Base64 encoding.
	 * 
	 * @param tokenResponse
	 * @param clientCredential
	 * @return Base64 string
	 */
	public static String serialize(GoogleTokenResponse tokenResponse, ClientCredential clientCredential) {
		try {
			byte[] json = JsonFactoryLocator.get().toByteArray(tokenResponse);
			byte[] encrypted = computeCipher(Cipher.ENCRYPT_MODE, clientCredential, json);
			return Base64.encodeBase64String(encrypted);
		} catch (IllegalBlockSizeException e) {
			throw new RuntimeException(e); // should not happen
		} catch (BadPaddingException e) {
			throw new RuntimeException(e); // should not happen
		}
	}

	/**
	 * Restore the {@link GoogleTokenResponse}.
	 * This method applies Base64 decoding, decryption and JSON deserialization.
	 * 
	 * @param session
	 *            Base64 string
	 * @return token response (<code>null</code> if invalid string given)
	 */
	public static GoogleTokenResponse restore(String session, ClientCredential clientCredential) {
		try {
			byte[] base64decoded = Base64.decodeBase64(session);
			byte[] decrypted = computeCipher(Cipher.DECRYPT_MODE, clientCredential, base64decoded);
			return JsonFactoryLocator.get().fromString(new String(decrypted), GoogleTokenResponse.class);
		} catch (IllegalBlockSizeException e) {
			logger.warning(e.toString());
			return null; // bad encryped data
		} catch (BadPaddingException e) {
			logger.warning(e.toString());
			return null; // bad encryped data
		} catch (IOException e) {
			logger.warning(e.toString());
			return null; // bad JSON
		}
	}

	/**
	 * Compute a cipher.
	 * 
	 * @param opmode
	 *            {@link Cipher#ENCRYPT_MODE} or {@link Cipher#DECRYPT_MODE}
	 * @param clientCredential
	 *            credential for encryption and decryption
	 * @param data
	 * @return encrypted data, or null if wrong credential or bad data
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 */
	private static byte[] computeCipher(int opmode, ClientCredential clientCredential, byte[] data)
			throws IllegalBlockSizeException, BadPaddingException {
		try {
			byte[] digest = DigestGenerator.create("SHA-256")
					.update(clientCredential.getClientSecret())
					.getAsBytes();
			byte[] first = new byte[16];
			byte[] second = new byte[16];
			System.arraycopy(digest, 0, first, 0, first.length);
			System.arraycopy(digest, first.length, second, 0, second.length);

			SecretKeySpec key = new SecretKeySpec(first, "AES");
			IvParameterSpec iv = new IvParameterSpec(second);

			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
			cipher.init(opmode, key, iv);
			return cipher.doFinal(data);
		} catch (InvalidKeyException e) {
			throw new RuntimeException(e); // should not happen
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException(e); // should not happen
		} catch (NoSuchPaddingException e) {
			throw new RuntimeException(e); // should not happen
		} catch (InvalidAlgorithmParameterException e) {
			throw new RuntimeException(e); // should not happen
		}
	}

	private SessionManager() {
	}

}
