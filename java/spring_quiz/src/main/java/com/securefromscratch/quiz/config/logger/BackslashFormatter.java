package com.securefromscratch.quiz.config.logger;

import java.util.logging.LogRecord;
import java.util.logging.SimpleFormatter;

import org.owasp.safetypes.SafeType;

public class BackslashFormatter extends SimpleFormatter {
    @Override
    public String formatMessage(LogRecord record) {
        String format = record.getMessage();
        java.util.ResourceBundle catalog = record.getResourceBundle();
        if (catalog != null) {
            try {
                format = catalog.getString(format);
            } catch (java.util.MissingResourceException ex) {
                // Drop through.  Use record message as format
            }
        }
        // Do the formatting.
        try {
            Object parameters[] = record.getParameters();
            if (parameters == null || parameters.length == 0) {
                // No parameters.  Just return format string.
                return format;
            }
            // Is it a java.text style format?
            // Ideally we could match with
            // Pattern.compile("\\{\\d").matcher(format).find())
            // However the cost is 14% higher, so we cheaply use indexOf
            // and charAt to look for that pattern.
            int index = -1;
            int fence = format.length() - 1;
            while ((index = format.indexOf('{', index+1)) > -1) {
                if (index >= fence) break;
                char digit = format.charAt(index+1);
                if (digit >= '0' && digit <= '9') {
                    parameters = encodeParameters(parameters);
                   return java.text.MessageFormat.format(format, parameters);
                }
            }
            return format;

        } catch (Exception ex) {
            // Formatting failed: use localized format string.
            return format;
        }
    }

    private Object[] encodeParameters(Object[] params) {
        Object[] encoded = new Object[params.length];
        for (int sanitizationIdx = 0 ; sanitizationIdx < params.length ; ++sanitizationIdx) {
            Object curObj = params[sanitizationIdx];
            if (curObj instanceof SafeType) {
                curObj = ((SafeType<?>)curObj).get();
            }
            if (curObj instanceof String) {
                encoded[sanitizationIdx] = encodeString((String)curObj);
            }
        }

        return encoded;
    }

    private String encodeString(String string) {
        // TODO: Backslash encode all control characters
        return string;
    }
}
