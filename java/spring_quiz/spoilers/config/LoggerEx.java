package com.securefromscratch.quiz.config;

import java.util.ResourceBundle;
import java.util.logging.*;

public class LoggerEx {
    private Logger m_logger;

    LoggerEx(Logger logger) {
        m_logger = logger;
    }

    public void warning(String msg, Object... params) {
        log(Level.WARNING, msg, params);
    }

    public void info(String msg, Object... params) {
        log(Level.INFO, msg, params);
    }

}
