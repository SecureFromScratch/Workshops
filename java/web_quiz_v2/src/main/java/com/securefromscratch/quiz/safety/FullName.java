package com.securefromscratch.quiz.safety;

import io.swagger.v3.oas.annotations.media.Schema;

import static com.securefromscratch.quiz.utils.StringFuncs.*;

public class FullName {
    public static final String VALID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.()";
    public static final int MIN_LENGTH = 3;
    public static final int MAX_LENGTH = 100;

    private String m_value;

    public FullName(String value) {
        if ((value.length() < MIN_LENGTH) || (value.length() > MAX_LENGTH)) {
            throw new IllegalArgumentException("illegal length");
        }

        // ensure full name has a space
        int spaceIdx = value.indexOf(' ');
        if (spaceIdx == -1) {
            throw new IllegalArgumentException("not a full name");
        }

        // block colon :
        //if (value.indexOf(':') != -1) {
        //    throw new IllegalArgumentException("illegal character");
        //}

        // block line feed / newline
        //if (value.indexOf('\n') != -1) {
        //    throw new IllegalArgumentException("illegal character");
        //}

        m_value = value;
    }

    public String get() {
        return m_value;
    }

    @Override
    public String toString() {
        return get();
    }
}
