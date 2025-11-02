package com.securefromscratch.quiz.utils;

public class StringFuncs {
    public static int countLeadingAllowedChars(String a_str, String a_allowedChars) {
        for (int i = 0; i < a_str.length() ; ++i) {
            if (a_allowedChars.indexOf(a_str.charAt(i)) == -1) {
                return i;
            }
        }
        return a_str.length();
    }
    
}
