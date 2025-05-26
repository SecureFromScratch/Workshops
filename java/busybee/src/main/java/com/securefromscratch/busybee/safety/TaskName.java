package com.securefromscratch.busybee.safety;

import io.swagger.v3.oas.annotations.media.Schema;
import org.owasp.safetypes.exception.TypeValidationException;
import org.owasp.safetypes.types.string.BoundedString;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

// a-z, space
@Schema(type = "String", description = "Task Name")
public class TaskName extends BoundedString {
    public static final int MIN_LENGTH = 5;
    public static final int MAX_LENGTH = 50;

    @ConstructorBinding
    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public TaskName(@JsonProperty("value") String value) throws TypeValidationException {
        super(value);
        if (!value.matches(pattern())) {
            throw new TypeValidationException("TaskName must be alphanumeric words separated by single spaces.");
        }
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
    
    public String pattern() {
        return "^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$";
    }

}
