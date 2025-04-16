
package com.securefromscratch.quiz;

import static j2html.TagCreator.data;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.HexFormat;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;



import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//@SpringBootApplication

public class EncryptionPoC {
    private static final int KEY_SIZE = 16; // 128 bits
    private static final int IV_SIZE = 12;  // 96 bits
    private static final int GCM_TAG_LENGTH = 128; // in bits

    public static void main1(String[] args) throws Exception {
        byte[] key = new byte[KEY_SIZE];
        byte[] iv = new byte[IV_SIZE];
        //new SecureRandom().nextBytes(key);
        //new SecureRandom().nextBytes(iv);

        String plaintext = "This is data to encrypt";
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");        
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);

        cipher.init(Cipher.ENCRYPT_MODE, keySpec, spec);
        byte[] ciphertext = cipher.doFinal(plaintext.getBytes());

        System.out.println("Ciphertext: " + Arrays.toString(ciphertext));
    }
    public static void main(String[] args) throws Exception {
        boolean isCorrect = false;
        byte[] key = new byte[KEY_SIZE];
        byte[] iv = new byte[IV_SIZE];
        //new SecureRandom().nextBytes(key);
        //new SecureRandom().nextBytes(iv);

        // string 
        //String plaintext = "This is data to encrypt";
        // one byte
        //byte b = 0;        
        //byte[] plaintext = new byte[] { b };
        // converting  isCorrect
        byte[] isCorrectAsBytes = new byte[ toByte(isCorrect)];
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);

        cipher.init(Cipher.ENCRYPT_MODE, keySpec, spec);
        // string 
        // byte[] ciphertext = cipher.doFinal(plaintext.getBytes());
        // one byte        
        //byte[] ciphertext = cipher.doFinal(plaintext);
        byte[] ciphertext = cipher.doFinal(isCorrectAsBytes);
        //char[] asHex = HexFormat.of().formatHex(ciphertext).toCharArray();       
        String asBase64 = Base64.getEncoder().encodeToString(ciphertext);

        // one type of printing
        // System.out.println("Ciphertext: " + Arrays.toString(ciphertext));
        // another way to print
        /*for(byte b1: ciphertext){
            System.out.print((char)b1);
            System.out.print("+");*/
        //System.out.println(asHex);
        System.out.println(asBase64);
        }
    private static byte toByte(boolean isCorrect) {
        // TODO Auto-generated method stub
        return (byte)(isCorrect?1:0);
    }
    
    }
        

