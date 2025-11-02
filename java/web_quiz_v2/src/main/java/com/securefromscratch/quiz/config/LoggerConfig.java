package com.securefromscratch.quiz.config;

import java.util.logging.*;

public class LoggerConfig {
    private final static Class<?>[] VALID_FORMATTERS = { SimpleFormatter.class /* TODO: This should NOT be a valid formatter. Replace it with a valid formatter */ };

    public static Logger genLogger(String name) {
        Logger logger = Logger.getLogger(name);
        //ensureFormattersAreValid(name, logger);
        return logger;
    }

    public static void ensureFormattersAreValid(String loggerName, Logger logger) {
        for (Handler handler : logger.getHandlers()) {
            Class<?> formatter = handler.getFormatter().getClass();
            if (!isValidFormatter(formatter)) {
                String msg = "{0} found in logger: {1}, handler: {2}";
                String handlerName = handler.getClass().getName();
                Object[] params = new Object[] { formatter.getName(), loggerName, handlerName };
                System.err.println(java.text.MessageFormat.format(msg, params));
                logger.log(Level.WARNING, msg, params);
            }
        }

        if (logger.getUseParentHandlers()) {
            Logger parent = logger.getParent();
            if (parent != null) {
                ensureFormattersAreValid(loggerName, parent);
            }
        }
    }

    private static boolean isValidFormatter(Class<?> formatter) {
        for (Class<?> validFormatter : VALID_FORMATTERS) {
            if (validFormatter.equals(formatter)) {
                return true;
            }
        }

        return false;
    }
}
