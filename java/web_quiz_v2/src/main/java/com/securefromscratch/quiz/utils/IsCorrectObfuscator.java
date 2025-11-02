package com.securefromscratch.quiz.utils;

import java.security.SecureRandom;

public class IsCorrectObfuscator {
    public static String encode(boolean a_isCorrect) {
        byte[] bytesToEncode = new byte[4];
        SecureRandom random = new SecureRandom();
        random.nextBytes(bytesToEncode);
        bytesToEncode[1] = (byte)(a_isCorrect ? 1 : 0);
        return java.util.Base64.getUrlEncoder().encodeToString(bytesToEncode);
    }

    public static boolean decode(String asBase64) {
        byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(asBase64);
        return decodedBytes[1] == 1;
    }
}
