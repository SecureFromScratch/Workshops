package com.securefromscratch.quiz.safety;

import io.swagger.v3.oas.annotations.media.Schema;
import org.owasp.safetypes.exception.TypeValidationException;
import org.owasp.safetypes.types.string.BoundedString;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

import static com.securefromscratch.quiz.utils.StringFuncs.*;

@Schema(type = "String", description = "Full Name")
public class FullName extends BoundedString {
    public static final String VALID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.()";
    public static final int MIN_LENGTH = 1;
    public static final int MAX_LENGTH = 40;

    @ConstructorBinding
    public FullName(String value) throws TypeValidationException {
        super(value);
    }

    @Override
    public Integer min() { return MIN_LENGTH; }

    @Override
    public Integer max() { return MAX_LENGTH; }

    @Override
    protected void validate(String value) throws TypeValidationException {
        int firstNameLen = countLeadingAllowedChars(value, VALID_CHARS);
        if (firstNameLen == 0) {
            throw new TypeValidationException();
        }

        value = value.substring(firstNameLen);
        int spacesLen = countLeadingAllowedChars(value, " ");
        if (spacesLen == 0) {
            throw new TypeValidationException();
        }

        value = value.substring(spacesLen);
        int surnameLen = countLeadingAllowedChars(value, VALID_CHARS);
        if (surnameLen == 0) {
            throw new TypeValidationException();
        }
    }

    @Override
    public String toString() {
        return get();
    }
}
