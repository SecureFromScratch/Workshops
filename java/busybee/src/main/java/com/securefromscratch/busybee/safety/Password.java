package com.securefromscratch.busybee.safety;


import io.swagger.v3.oas.annotations.media.Schema;
import org.owasp.safetypes.exception.TypeValidationException;
import org.owasp.safetypes.types.string.words.BoundedWord;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

///
/// Do ataptation for security 
/// 
@Schema(type = "String", description = "Password")
public class Password extends BoundedWord {
    public static final int MIN_LENGTH = 1;
    public static final int MAX_LENGTH = 20;

    @ConstructorBinding
    public Password(String value) throws TypeValidationException {
        super(value);
    }

    @Override
    public Integer min() { return MIN_LENGTH; }

    @Override
    public Integer max() { return MAX_LENGTH; }
}