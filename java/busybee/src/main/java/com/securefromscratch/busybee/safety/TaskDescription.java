package com.securefromscratch.busybee.safety;

import io.swagger.v3.oas.annotations.media.Schema;
import org.owasp.safetypes.exception.TypeValidationException;
import org.owasp.safetypes.types.string.BoundedString;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

// a-z, space, newline
@Schema(type = "String", description = "Task Description")
public class TaskDescription extends BoundedString {
    public static final int MIN_LENGTH = 5;
    public static final int MAX_LENGTH = 300;

    @ConstructorBinding
    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public TaskDescription(@JsonProperty("value") String value) throws TypeValidationException {
        super(value);
    }

    @Override
    public Integer min() {
        return MIN_LENGTH;
    }

    @Override
    public Integer max() {
        return MAX_LENGTH;
    }

    @Override
    public String toString() {
        String value = get();
        return value != null ? value : "";
    }
}
