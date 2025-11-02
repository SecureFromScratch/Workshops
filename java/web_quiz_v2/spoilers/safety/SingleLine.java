package com.securefromscratch.quiz.safety;

import org.owasp.safetypes.exception.TypeValidationException;
import org.owasp.safetypes.types.string.BoundedString;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

abstract class SingleLine extends BoundedString {
    @ConstructorBinding
    public SingleLine(String value) throws TypeValidationException {
        super(value);
    }

    @Override
    protected final void validate(String value) throws TypeValidationException {
        if(value == null)
            return;

        for (int i=0; i<value.length(); i++) {
            char c = value.charAt(i);
            if (!Character.isISOControl(c))
                continue;
            if ("\t".indexOf(c) != -1)
                continue;
            throw new TypeValidationException();
        }
    }
}
