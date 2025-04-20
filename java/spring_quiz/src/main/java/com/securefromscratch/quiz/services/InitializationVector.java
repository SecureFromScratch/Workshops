package com.securefromscratch.quiz.services;

import java.security.SecureRandom;
import java.util.concurrent.atomic.AtomicInteger;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class InitializationVector {

    private static final int IV_LENGTH = 12;
    private static final AtomicInteger counter = new AtomicInteger(0);

    public byte[] generate() {
        byte[] iv = new byte[IV_LENGTH];
        ByteBuffer buffer = ByteBuffer.wrap(iv);

        // 4 bytes - current time (truncated)
        buffer.putInt((int) (System.currentTimeMillis() & 0xFFFFFFFF));

        // 4 bytes - atomic counter
        buffer.putInt(counter.getAndIncrement());

        // 4 bytes - secure random
        byte[] randomBytes = new byte[4];
        new SecureRandom().nextBytes(randomBytes);
        buffer.put(randomBytes);

        return iv;
        
    }

    
    
    

    public static void main(String[] args) {
        InitializationVector generator = new InitializationVector();
        byte[] iv = generator.generate();
        System.out.println(Arrays.toString(iv));
    }
}
