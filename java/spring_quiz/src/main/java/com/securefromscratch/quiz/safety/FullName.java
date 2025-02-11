package com.securefromscratch.quiz.safety;

import io.swagger.v3.oas.annotations.media.Schema;
import org.owasp.safetypes.exception.TypeValidationException;
import org.owasp.safetypes.types.string.BoundedString;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

@Schema(type = "String", description = "Full Name")
public class FullName extends BoundedString {
    public static final String VALID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.()";
    public static final int MIN_LENGTH = 1;
    public static final int MAX_LENGTH = 1000; // TODO: this is intentionally too big, for demonstration purposes. Give it a smaller value.

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
        int spaceIdx = value.indexOf(' ');
        if (spaceIdx == 0) {
            throw new TypeValidationException();
        }
    }


    @Override
    public String toString() {
        return get();
    }
}
