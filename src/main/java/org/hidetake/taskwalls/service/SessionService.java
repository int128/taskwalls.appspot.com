package org.hidetake.taskwalls.service;

import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.hidetake.taskwalls.model.Session;
import org.hidetake.taskwalls.model.oauth2.ClientCredential;
import org.hidetake.taskwalls.util.DigestGenerator;

/**
 * Service class for model {@link Session}.
 * 
 * @author hidetake.org
 */
public class SessionService {

	private SessionService() {
	}

	/**
	 * Encode the session object to string.
	 * 
	 * @param session
	 * @return
	 */
	public static String encode(Session session) {
		StringBuilder builder = new StringBuilder();
		builder.append(session.getAccessToken());
		builder.append("\0");
		builder.append(session.getRefreshToken());
		builder.append("\0");
		builder.append(session.getExpiration().getTime());
		return builder.toString();
	}

	/**
	 * Decode string expression to the session.
	 * 
	 * @param encoded
	 * @return
	 */
	public static Session decode(String encoded) {
		String[] parts = encoded.split("\0");
		if (parts.length != 3) {
			throw new IllegalArgumentException("encoded string corrupted");
		}
		Session session = new Session();
		session.setAccessToken(parts[0]);
		session.setRefreshToken(parts[1]);
		session.setExpiration(new Date(Long.parseLong(parts[2])));
		return session;
	}

	/**
	 * Encode and encrypt the session.
	 * 
	 * @param session
	 *            the session
	 * @param credential
	 *            credential for encryption
	 * @return encrypted bytes
	 */
	public static byte[] encodeAndEncrypt(Session session, ClientCredential credential) {
		byte[] encoded = encode(session).getBytes();
		byte[] encrypted = computeCipher(Cipher.ENCRYPT_MODE, credential, encoded);
		return encrypted;
	}

	/**
	 * Decrypt and decode the session.
	 * 
	 * @param encrypted
	 *            encrypted bytes
	 * @param credential
	 *            credential for encryption
	 * @return the session, or null if wrong credential or bad data
	 */
	public static Session decryptAndDecode(byte[] encrypted, ClientCredential credential) {
		byte[] decrypted = computeCipher(Cipher.DECRYPT_MODE, credential, encrypted);
		if (decrypted == null) {
			return null;
		}
		Session decoded = decode(new String(decrypted));
		return decoded;
	}

	/**
	 * Compute a cipher.
	 * 
	 * @param opmode
	 *            {@link Cipher#ENCRYPT_MODE} or {@link Cipher#DECRYPT_MODE}
	 * @param credential
	 *            credential for encryption or decryption
	 * @param data
	 * @return encrypted data, or null if wrong credential or bad data
	 */
	private static byte[] computeCipher(int opmode, ClientCredential credential, byte[] data) {
		try {
			byte[] digest = DigestGenerator.create("SHA-256")
					.update(credential.getClientSecret())
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
			// this should not happen
			throw new RuntimeException(e);
		} catch (NoSuchAlgorithmException e) {
			// this should not happen
			throw new RuntimeException(e);
		} catch (NoSuchPaddingException e) {
			// this should not happen
			throw new RuntimeException(e);
		} catch (InvalidAlgorithmParameterException e) {
			// this should not happen
			throw new RuntimeException(e);
		} catch (IllegalBlockSizeException e) {
			return null;
		} catch (BadPaddingException e) {
			return null;
		}
	}

}
