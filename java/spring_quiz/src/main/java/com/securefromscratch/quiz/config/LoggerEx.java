package com.securefromscratch.quiz.config;

import java.text.MessageFormat;
import java.util.logging.Level;
import java.util.logging.Logger;

public class LoggerEx {
    ///
    /// LOGGER.info(String.format("/question with name=%s", username));
    /// ANSWERS_LOGGER.warning("Right: " + username);
    ///
    ///
    private Logger m_logger;

    public LoggerEx(Logger logger) {
        m_logger = logger;
    }

    public void info(String msg, Object... params) {
        //params = replaceAllControlCharacters(params);
        //m_logger.info(MessageFormat.format(msg, params));
        m_logger.log(Level.INFO, msg, params);
    }

    public void Warning(String msg, Object... params) {
        //params = replaceAllControlCharacters(params);
        //m_logger.warning(MessageFormat.format(msg, params));
        m_logger.log(Level.WARNING, msg, params);
    }

    private Object[] replaceAllControlCharacters(Object[] params) {
        for (int i = 0; i < params.length; i++) {
            params[i] = replaceAllControlCharacters(params[i].toString());
        }
        return params;
    }

    private String replaceAllControlCharacters(String unsafe) {
        StringBuilder sb = new StringBuilder();
        for (char c : unsafe.toCharArray()) {
            if (Character.isISOControl(c)) {
                sb.append("#");
            } else {
                sb.append(c);
            }
        }

        return sb.toString();
    }

    

}
