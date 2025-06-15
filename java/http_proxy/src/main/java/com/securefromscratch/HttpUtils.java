package com.securefromscratch;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class HttpUtils {
    public static String readLine(InputStream in) throws IOException {
        ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();

        while (true) {
            int b = in.read();
            if (b == -1) {
                // End of stream — if we haven't accumulated anything -> return null
                if (byteBuffer.size() == 0) {
                    return null;
                }
                break;
            }

            if (b == '\n') {
                // Correct end of line (either \n alone)
                break;
            } else if (b == '\r') {
                // Possible start of \r\n — we must check next char
                int next = in.read();
                if (next == '\n') {
                    // Proper \r\n — good
                    break;
                } else if (next == -1) {
                    // Stream ended after \r
                    byteBuffer.write('\r');
                    break;
                } else {
                    // Lone \r, not followed by \n → treat \r as data, keep reading
                    byteBuffer.write('\r');
                    byteBuffer.write(next);
                }
            } else {
                byteBuffer.write(b);
            }
        }

        return byteBuffer.toString(StandardCharsets.UTF_8.name());
    }
}
