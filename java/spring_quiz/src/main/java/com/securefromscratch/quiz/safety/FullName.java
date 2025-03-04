package com.securefromscratch.quiz.safety;

import io.swagger.v3.oas.annotations.media.Schema;

import static com.securefromscratch.quiz.utils.StringFuncs.*;

public class FullName {
    public static final String VALID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.()";
    public static final int MIN_LENGTH = 3;
    public static final int MAX_LENGTH = 40;

    private String m_value;

    public FullName(String value) {
        int spaceIdx = value.indexOf(' ');
        if (spaceIdx == -1) {
            throw new IllegalArgumentException(value);
        }

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
