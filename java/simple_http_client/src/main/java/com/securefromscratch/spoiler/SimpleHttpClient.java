package com.securefromscratch.spoiler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;

public class SimpleHttpClient {
    public static void main(String[] args) {
        String hostname = args.length > 0 ? args[0] : "httpbin.org";
        int port = 80; // Default HTTP port
        String path = args.length > 1 ? args[args.length - 1] : "/";

        if (args.length == 3) {
            try {
                port = Integer.valueOf(args[1]);
                if (port <= 0) {
                    throw new NumberFormatException();
                } 
            }
            catch (NumberFormatException ex) {
                System.out.println("Usage: java SimpleHttpClient <hostname> [port] <path>");
                System.out.println("Port must be a positive integer number");
                return;
            }
        }
        if (args.length != 2 && args.length != 3) {
            System.out.println("Usage: java SimpleHttpClient <hostname> [port] <path>");
            System.out.println("Defaulting to interactive session.");
            System.out.print(String.format("Enter hostname (%s): ", hostname));
            String newHostname = System.console().readLine();
            if (!newHostname.isEmpty()) {
                hostname = newHostname;
            }
            System.out.print(String.format("Enter path (%s): ", path));
            String newPath = System.console().readLine();
            if (!newPath.isEmpty()) {
                path = newPath;
            }
        }

        try (Socket socket = new Socket(hostname, port);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), false);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

            // Sending an HTTP GET request
            // QUESTION: Why is using println wrong?
            out.println("GET " + path + " HTTP/1.1");
            out.println("Host: " + hostname);
            out.println("Connection: close");
            out.println();
            out.flush();

            // Reading the response
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
