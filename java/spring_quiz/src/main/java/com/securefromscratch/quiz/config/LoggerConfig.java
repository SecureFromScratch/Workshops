package com.securefromscratch.quiz.config;

import java.util.logging.*;

public class LoggerConfig {
    public static Logger genLogger(String name) {
        Logger logger = Logger.getLogger(name);
        return logger;
    }
}
