package com.securefromscratch;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class ProxyMain {
    private static final int BROWSER_PORT = 8070; // Change this to your desired port
    private static final String TARGET_DOMAIN = "www.securefromscratch.com";
    private static final int TARGET_PORT = 80; // Change this to your desired port

    public static void main(String[] args) {
        try (ServerSocket serverSocket = new ServerSocket(BROWSER_PORT)) {
            System.out.println("Waiting for browser on port " + BROWSER_PORT);

            while (true) {
                try {
                    Socket clientSocket = serverSocket.accept();
                    System.out.println("Client connected: " + clientSocket.getInetAddress());

                    new ProxyConnectionHandler(clientSocket, BROWSER_PORT, TARGET_DOMAIN, TARGET_PORT).run();
                } catch (IOException e) {
                    System.err.println("Error accepting client connection: " + e.getMessage());
                }
            }
        } catch (IOException e) {
            System.err.println("Could not start proxy on port " + BROWSER_PORT + ": " + e.getMessage());
        }
    }
}
