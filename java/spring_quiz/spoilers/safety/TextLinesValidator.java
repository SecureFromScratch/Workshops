package com.securefromscratch.quiz.safety;

import io.swagger.v3.oas.annotations.media.Schema;
import org.owasp.safetypes.exception.TypeValidationException;
import org.owasp.safetypes.types.string.BoundedString;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

import static com.securefromscratch.quiz.utils.StringFuncs.*;

public class TextLinesValidator {
    private static int countLeadingAllowedChars(String a_str, String a_allowedChars) {
        for (int i = 0; i < a_str.length() ; ++i) {
            if (a_allowedChars.indexOf(a_str.charAt(i)) == -1) {
                return i;
            }
        }
        return a_str.length();
    }

    private static boolean isTextLines(String value) {
        int lenAllowedChars = countLeadingAllowedChars(value, VALID_CHARS);
        //return ...;
        return false;
    }
}

