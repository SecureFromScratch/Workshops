package com.securefromscratch.quiz.safety;

import io.swagger.v3.oas.annotations.media.Schema;
import org.owasp.safetypes.exception.TypeValidationException;
import org.owasp.safetypes.types.integer.LimitedInteger;
import org.owasp.safetypes.types.string.BoundedString;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

@Schema(type = "String", description = "Text of answer selected by user")
public final class AnswerText extends SingleLine {
    public static final int MIN_ANSWER_LENGTH = 1;
    public static final int MAX_ANSWER_LENGTH = 400;

    @ConstructorBinding
    public AnswerText(String value) throws TypeValidationException {
        super(value);
    }

    @Override
    public Integer min() { return MIN_ANSWER_LENGTH; }

    @Override
    public Integer max() { return MAX_ANSWER_LENGTH; }
}
