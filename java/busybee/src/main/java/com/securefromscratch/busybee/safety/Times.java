package com.securefromscratch.busybee.safety;

import io.swagger.v3.oas.annotations.media.Schema;
import org.owasp.safetypes.exception.TypeValidationException;
import org.owasp.safetypes.types.integer.LimitedInteger;

@Schema(type = "int", description = "Hello times")
public class Times extends LimitedInteger {
    public static final int MIN_TIMES = 1;
    public static final int MAX_TIMES = 100;

    public static Times from(int value) throws TypeValidationException {
        return new Times(value);
    }

    private static Integer valueOf(String value) throws TypeValidationException {
        try {
            return Integer.valueOf(value);
        }
        catch (Exception e) {
            throw new TypeValidationException();
        }
    }

    public Times(String value) throws TypeValidationException {
        super(valueOf(value));
    }

    protected Times(int value) throws TypeValidationException {
        super(value);
    }

    @Override
    public Integer min() { return MIN_TIMES; }

    @Override
    public Integer max() { return MAX_TIMES; }
}
