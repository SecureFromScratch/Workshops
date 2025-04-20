package com.securefromscratch.quiz.services;

import static j2html.TagCreator.data;

import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.HexFormat;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import ch.qos.logback.classic.pattern.SyslogStartConverter;

public class EncryptionUtil {
    private static final int KEY_SIZE = 16; // 128 bits
    private static final int IV_SIZE = 12; // 96 bits
    private static final int GCM_TAG_LENGTH = 128; // in bits

    
    private static final byte[] key;

    static {
        try {
            key = KeyManager.generateKey();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating AES key", e);
        }
    }

    public static String encryptBoolean(boolean isCorrect) {
        // byte[] key = new byte[KEY_SIZE];
        byte[] iv = new byte[IV_SIZE];
        new SecureRandom().nextBytes(iv);

        byte[] isCorrectAsBytes = new byte[] { toByte(isCorrect) };
        byte[] ciphertext = processCrypto(1, isCorrectAsBytes, key, iv);

        byte[] combinedBytes = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, combinedBytes, 0, iv.length);
        System.arraycopy(ciphertext, 0, combinedBytes, iv.length, ciphertext.length);

        String asBase64 = Base64.getUrlEncoder().encodeToString(combinedBytes);
        return asBase64;
    }

    public static boolean dncryptBoolean(String value) {
        // byte[] key = new byte[KEY_SIZE];
        byte[] iv = new byte[IV_SIZE];

        byte[] combinedBytes = Base64.getUrlDecoder().decode(value);
        byte[] byteTpProcess = new byte[combinedBytes.length - iv.length];
        System.arraycopy(combinedBytes, 0, iv, 0, iv.length);
        System.arraycopy(combinedBytes, iv.length, byteTpProcess, 0, combinedBytes.length - iv.length);

        byte[] result = processCrypto(2, byteTpProcess, key, iv);

        return byteToBolean(result);
    }

    private static boolean byteToBolean(byte[] result) {
        return (boolean) (result[0] == 1 ? true : false);
    }

    public static byte[] processCrypto(int encrypt_mode, byte[] value, byte[] key, byte[] iv) {
        Cipher cipher = null;

        try {
            cipher = Cipher.getInstance("AES/GCM/NoPadding");

            SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);

            cipher.init(encrypt_mode, keySpec, spec);

            byte[] result = null;
            result = cipher.doFinal(value);
            return result;
        } catch (NoSuchAlgorithmException | NoSuchPaddingException e) {
            System.exit(666);
            throw new RuntimeException();
        } catch (InvalidKeyException | InvalidAlgorithmParameterException e) {
            System.exit(666);
            throw new RuntimeException();
        } catch (IllegalBlockSizeException | BadPaddingException e) {
            System.exit(666);
            throw new RuntimeException();
        }
    }

    private static byte toByte(boolean isCorrect) {
        return (byte) (isCorrect ? 1 : 0);
    }

}
