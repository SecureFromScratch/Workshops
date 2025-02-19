package com.securefromscratch.quiz.config;

import java.util.ResourceBundle;
import java.util.logging.*;

public class LoggerEx {
    private Logger m_logger;

    LoggerEx(Logger logger) {
        m_logger = logger;
    }

    public ResourceBundle getResourceBundle() {
        return m_logger.getResourceBundle();
    }

    public void setFilter(Filter newFilter) throws SecurityException {
        m_logger.setFilter(newFilter);
    } 

    public Filter getFilter() {
        return m_logger.getFilter();
    }

    public void log(Level level, String msg) {
        m_logger.log(level, msg);
    }

    public void log(Level level, String msg, Object... params) {
        m_logger.log(level, msg, params);
    }

    public void log(Level level, String msg, Throwable thrown) {
        m_logger.log(level, msg, thrown);
    }

    /**
     * Log a SEVERE message.
     * <p>
     * If the logger is currently enabled for the SEVERE message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void severe(String msg) {
        log(Level.SEVERE, msg);
    }

    /**
     * Log a WARNING message.
     * <p>
     * If the logger is currently enabled for the WARNING message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void warning(String msg) {
        log(Level.WARNING, msg);
    }

    /**
     * Log an INFO message.
     * <p>
     * If the logger is currently enabled for the INFO message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void info(String msg) {
        log(Level.INFO, msg);
    }

    /**
     * Log a CONFIG message.
     * <p>
     * If the logger is currently enabled for the CONFIG message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void config(String msg) {
        log(Level.CONFIG, msg);
    }

    /**
     * Log a FINE message.
     * <p>
     * If the logger is currently enabled for the FINE message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void fine(String msg) {
        log(Level.FINE, msg);
    }

    /**
     * Log a FINER message.
     * <p>
     * If the logger is currently enabled for the FINER message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void finer(String msg) {
        log(Level.FINER, msg);
    }

    /**
     * Log a FINEST message.
     * <p>
     * If the logger is currently enabled for the FINEST message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void finest(String msg) {
        log(Level.FINEST, msg);
    }

    /**
     * Log a SEVERE message.
     * <p>
     * If the logger is currently enabled for the SEVERE message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void severe(String msg, Object... params) {
        log(Level.SEVERE, msg, params);
    }

    /**
     * Log a WARNING message.
     * <p>
     * If the logger is currently enabled for the WARNING message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void warning(String msg, Object... params) {
        log(Level.WARNING, msg, params);
    }

    /**
     * Log an INFO message.
     * <p>
     * If the logger is currently enabled for the INFO message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void info(String msg, Object... params) {
        log(Level.INFO, msg, params);
    }

    /**
     * Log a CONFIG message.
     * <p>
     * If the logger is currently enabled for the CONFIG message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void config(String msg, Object... params) {
        log(Level.CONFIG, msg, params);
    }

    /**
     * Log a FINE message.
     * <p>
     * If the logger is currently enabled for the FINE message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void fine(String msg, Object... params) {
        log(Level.FINE, msg, params);
    }

    /**
     * Log a FINER message.
     * <p>
     * If the logger is currently enabled for the FINER message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void finer(String msg, Object... params) {
        log(Level.FINER, msg, params);
    }

    /**
     * Log a FINEST message.
     * <p>
     * If the logger is currently enabled for the FINEST message
     * level then the given message is forwarded to all the
     * registered output Handler objects.
     *
     * @param   msg     The string message (or a key in the message catalog)
     */
    public void finest(String msg, Object... params) {
        log(Level.FINEST, msg, params);
    }    
}
