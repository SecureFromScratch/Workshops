package com.securefromscratch.quiz.unitTests;

import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class HackEncryption {
    public static void main(String[] args) throws Exception {
        // Replace this with any encrypted string produced by encryptBoolean
        String encrypted = "AAAAAAAAAAAAAAAAAqo5v04zhqFIuzkKXdaL9VA="; 

        byte[] combined = Base64.getUrlDecoder().decode(encrypted);
        byte[] iv = new byte[12];
        byte[] ciphertext = new byte[combined.length - 12];
        System.arraycopy(combined, 0, iv, 0, 12);
        System.arraycopy(combined, 12, ciphertext, 0, ciphertext.length);

        byte[] key = new byte[16]; // static null key

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(128, iv);
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");

        cipher.init(Cipher.DECRYPT_MODE, keySpec, spec);
        byte[] plain = cipher.doFinal(ciphertext);

        System.out.println("Decrypted boolean: " + (plain[0] == 1));
    }
}

