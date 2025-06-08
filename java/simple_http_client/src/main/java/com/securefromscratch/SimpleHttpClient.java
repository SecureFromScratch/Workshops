package com.securefromscratch;

import java.io.*;
import java.net.*;

public class SimpleHttpClient {
    public static void main(String[] args) {
        // ========[PARTIALLY IMPLEMENTED] CONTROL HOSTNAME, PORT, PATH HERE=========
        String hostname = "www.securefromscratch.com";
        int port = 80;
        String path = "/simple.html";
        String bodyOutputFile = null;
        // ========END OF CONTROL HOSTNAME, PORT, PATH=========

        try (Socket socket = new Socket(hostname, port);
            PrintWriter out = new PrintWriter(socket.getOutputStream(), false);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

            // ========MODIFY CODE HERE=========
            // Send an HTTP GET request
            out.write("GET /simple.html HTTP/1.1\r\n");
            out.write("Host: www.securefromscratch.com\r\n");
            out.write("Connection: close\r\n");
            out.write("\r\n");
            // ========END OF MODIFY CODE AREA=========

            out.flush(); // ANSWER: What does this do? Why is it needed?

            // Reading and printing out the response
            String responseLine;
            while ((responseLine = in.readLine()) != null) {
                System.out.println(responseLine);
            }
        } catch (UnknownHostException e) {
            System.err.println("Unknown host: " + hostname);
        } catch (IOException e) {
            System.err.println("Error in communication with the server: " + e.getMessage());
        }
    }
}
