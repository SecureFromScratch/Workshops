package com.securefromscratch.quiz.config;

import java.util.logging.*;

import com.securefromscratch.quiz.config.logger.BackslashFormatter;

public class LoggerConfig {
    private final static Class<?>[] VALID_FORMATTERS = { BackslashFormatter.class };

    private static Set<String> m_testedLoggers = new HashSet<String>();

    public static LoggerEx genLogger(String name) {
        Logger logger = Logger.getLogger(name);
        if (!m_testedLoggers.contains(name)) {
            m_testedLoggers.add(name);
            ensureFormattersAreValid(name, logger);
        }
        return new LoggerEx(logger);
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
