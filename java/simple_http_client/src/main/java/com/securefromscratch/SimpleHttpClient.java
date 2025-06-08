package com.securefromscratch;

import java.io.*;
import java.net.*;

public class SimpleHttpClient {
    public static void main(String[] args) {
        // ========[PARTIALLY IMPLEMENTED] CONTROL HOSTNAME, PORT, PATH HERE=========
        String hostname = "www.securefromscratch.com";
        int port = 80;
        String path = "/simple.html";
        String bodyOutputFilename = null;
        // ========END OF CONTROL HOSTNAME, PORT, PATH=========

        try (Socket socket = new Socket(hostname, port);
            OutputStream toServer = socket.getOutputStream();
            InputStream fromServer = socket.getInputStream()
        ) {
            sendVerbAndHeaders(toServer);
            toServer.flush(); // ANSWER: What does this do? Why is it needed?

            boolean includeBodyInConsoleOutput = (bodyOutputFilename == null) || bodyOutputFilename.isEmpty();
            outputToConsole(fromServer, includeBodyInConsoleOutput);

            if (!includeBodyInConsoleOutput) {
                outputRestToBinaryFile(fromServer, bodyOutputFilename);
            }
        } catch (UnknownHostException e) {
            System.err.println("Unknown host: " + hostname);
        } catch (IOException e) {
            System.err.println("Error in communication with the server: " + e.getMessage());
        }
    }

    private static void sendVerbAndHeaders(OutputStream toServer) throws UnsupportedEncodingException, IOException {
        // ========MODIFY CODE HERE=========
        // Send an HTTP GET request
        toServer.write("GET /simple.html HTTP/1.1\r\n".getBytes("UTF-8"));
        toServer.write("Host: www.securefromscratch.com\r\n".getBytes("UTF-8"));
        toServer.write("Connection: close\r\n".getBytes("UTF-8"));
        toServer.write("\r\n".getBytes("UTF-8"));
        // ========END OF MODIFY CODE AREA=========
    }

    private static void outputToConsole(InputStream fromServer, boolean includeBodyInConsoleOutput) throws IOException {
        // ========MODIFY OUTPUT CODE=========
        // Reading and printing out the response
        String responseLine;
        while (((responseLine = readLine(fromServer)) != null) 
            && includeBodyInConsoleOutput) {
            System.out.println(responseLine);
        }
        // ========END OF MODIFY OUTPUT CODE AREA=========
    }

    private static void outputRestToBinaryFile(InputStream fromServer, String bodyOutputFilename) throws FileNotFoundException, IOException {
        try (FileOutputStream bodyOut = new FileOutputStream(bodyOutputFilename)) {
            fromServer.transferTo(bodyOut);
        }
    }

    // NOTE: Assumes encoding is either ascii or utf-8
    public static String readLine(InputStream in) throws IOException {
        int b = in.read();
        if (b == -1) {
            return null; // end of stream
        }
        
        ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
        boolean gotCR = false;
        do {
            if (b == '\n') {
                // \n or \r\n ends the line
                gotCR = false; // reset gotCR
                break;
            } else if (gotCR) {
                // Previous was \r not followed by \n → treat \r as part of content
                byteBuffer.write('\r');
                gotCR = false;
            }

            if (b == '\r') {
                // Possible start of \r\n — wait for next char
                gotCR = true;
            } else {
                byteBuffer.write(b);
            }
            b = in.read();
        } while (b != -1);

        // push dangling \r
        if (gotCR) {
            byteBuffer.write('\r');
        }

        // Convert accumulated bytes to UTF-8 string
        return byteBuffer.toString("UTF-8");
    }
}
