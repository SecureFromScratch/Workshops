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

    // this method is called to create a copy of parameters
    // only *after* we are sure a copy is actually needed
    // (because at least one parameter needs to be a encoded string)
    private Object[] continueSanitizingParameters(Object[] params, int sanitizationIdx, String encodedString) {
        Object[] encoded = new Object[params.length];
        for (int i = 0 ; i < sanitizationIdx ; ++i) {
            encoded[i] = params[i];
        }
        encoded[sanitizationIdx] = encodedString;
        for (++sanitizationIdx ; sanitizationIdx < params.length ; ++sanitizationIdx) {
            Object curObj = params[sanitizationIdx];
            encoded[sanitizationIdx] = (curObj instanceof String)
                ? encodeString((String)curObj) : params[sanitizationIdx].toString();
        }
        return encoded;
    }

    private Object[] encodeParameters(Object[] params) {
        int sanitizationIdx = 0;
        for ( ; sanitizationIdx < params.length ; ++sanitizationIdx) {
            Object curObj = params[sanitizationIdx];
            if (curObj instanceof SafeType) {
                curObj = ((SafeType<?>)curObj).get();
            }
            if (curObj instanceof String) {
                String encodedString = encodeString((String)curObj);
                if (encodedString != curObj) { /* intentional reference comparison */
                    return continueSanitizingParameters(params, sanitizationIdx, encodedString);
                }
            }
        }

        return params;
    }

    private String continueSanitizingString(String string, int sanitizationIdx) {
        StringBuilder sb = new StringBuilder(string.length() + 16 + (string.length() / 10) /*estimate of number of extra chars for describing control chars */);
        sb.append(string, 0, sanitizationIdx);

        do {
            char c = string.charAt(sanitizationIdx);
            switch (c) {
                case '\b': sb.append("\\b"); break;
                case '\t': sb.append("\\t"); break;
                case '\n': sb.append("\\n"); break;
                case '\f': sb.append("\\f"); break;
                case '\r': sb.append("\\r"); break;
                case '\"': sb.append("\\\""); break;
                case '\'': sb.append("\\'"); break;
                case '\\': sb.append("\\\\"); break;
                default:
                    if (Character.isISOControl(c)) { // Handle non-printable characters
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }

            ++sanitizationIdx;
        } while (sanitizationIdx < string.length());

        return sb.toString();
    }

    private String encodeString(String string) {
        int charIdx = 0;
        for (; charIdx < string.length() ; ++charIdx) {
            if (Character.isISOControl(string.charAt(charIdx))) {
                return continueSanitizingString(string, charIdx);
            }
        }
        return string;
    }

    static boolean hasNewlineChar(Object curObj) {
        if (curObj instanceof String) {
            if (((String)curObj).indexOf('\n') != -1) {
                return true;
            }
            if (((String)curObj).indexOf('\r') != -1) {
                return true;
            }
        }
        return false;
    }
}
