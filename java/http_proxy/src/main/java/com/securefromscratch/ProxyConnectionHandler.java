package com.securefromscratch;

import java.io.*;
import java.net.Socket;
import java.util.Arrays;

public class ProxyConnectionHandler implements Runnable {
    private final static int MAX_PREVIEW_BYTES = 160;
    private static final String[] INCLUSION_FILTERS = null;//new String[] { "^/$", ".html$", "/login", "/tasks" };
    private static final String[] RESPONSE_HEADERS_TO_REMOVE = null; // new String[] { "nosniff" };
    private static final String[] RESPONSE_HEADERS_TO_ADD = null; // new String[] { "content-type: image/jpeg" };    
    
    private Socket clientSocket;
    private int browserPort;
    private String targetHost;
    private int targetPort;

    public ProxyConnectionHandler(Socket clientSocket, int browserPort, String targetHost, int targetPort) {
        this.clientSocket = clientSocket;
        this.browserPort = browserPort;
        this.targetHost = targetHost;
        this.targetPort = targetPort;
    }

    @Override
    public void run() {
        try (
            Socket serverSocket = new Socket(targetHost, targetPort);
            InputStream clientIn = clientSocket.getInputStream();
            OutputStream clientOut = clientSocket.getOutputStream();
            InputStream serverIn = serverSocket.getInputStream();
            OutputStream serverOut = serverSocket.getOutputStream();
        ) {
            // Forward client → server with console output
            String oldHostHeader = "host: localhost:" + browserPort;
            String newHostHeader = "Host: " + targetHost + (targetPort == 80 ? "" : (":" + targetPort));
            String[] requestHeadersToRemove = new String[] { oldHostHeader, "Accept-Encoding:" };
            String[] requestHeadersToAdd = new String[] { newHostHeader };
            boolean printOut = forwardWithHeaderLogging(INCLUSION_FILTERS, clientIn, serverOut, "REQUEST", requestHeadersToRemove, requestHeadersToAdd);

            // Forward server → client with console output
            forwardWithHeaderLogging(printOut ? null : new String[0], serverIn, clientOut, "RESPONSE", RESPONSE_HEADERS_TO_REMOVE, RESPONSE_HEADERS_TO_ADD);

            if (printOut) {
                System.out.println("================================================================\n");
            }
        } catch (IOException e) {
            System.err.println("Error handling connection: " + e.getMessage());
        } finally {
            try {
                clientSocket.close();
            } catch (IOException ignore) {}
        }
    }

    private static boolean forwardWithHeaderLogging(String[] inclusionFilters, InputStream in, OutputStream out, String directionLabel, String[] headersToRemove, String[] headersToAdd) throws IOException {
        int bodySize = 0;
        boolean isChunked = false;

        boolean printOut = forwardFirstLine(inclusionFilters, in, out, directionLabel);

        while (true) {
            String line = HttpUtils.readLine(in);
            if (line == null) {
                break;
            }

            if (line.toLowerCase().startsWith("content-length:")) {
                bodySize = Integer.parseInt(line.split(":")[1].trim());
            }
            if (line.toLowerCase().startsWith("transfer-encoding: chunked")) {
                isChunked = true;
            }

            // Empty line → end of headers
            if (line.isEmpty()) {
                break; // exit headers
            }

            possiblyForwardHeader(line, headersToRemove, out, printOut);
        }

        // send injected (added) headers
        sendInjectedHeaders(headersToAdd, in, out, printOut);

        // forward empty line
        forwardEmptyLine(out, printOut);

        if (!isChunked && bodySize == 0) {
            return printOut;
        }

        // BEGIN BODY
        // Forward body as binary
        if (isChunked) {
            boolean isFirstChunk = true;
            while (forwardBinaryChunk(in, out, isFirstChunk && printOut)) {
                isFirstChunk = false;
            }
        }
        else {
            forwardRawBytes(in, out, bodySize, printOut);
        }

        return printOut;
    }

    private static boolean forwardFirstLine(String[] inclusionFilters, InputStream in, OutputStream out, String directionLabel) throws IOException {
        String firstLine = HttpUtils.readLine(in);
        if (firstLine == null) {
            throw new IOException("connection closed");
        }
        String path = firstLine.split(" ")[1].trim();
        String pathForMatching = "^" + path.toLowerCase() + "$";
        boolean printOut = (inclusionFilters == null) || Arrays.stream(inclusionFilters).anyMatch(toMatch->pathForMatching.contains(toMatch.toLowerCase()));
        
        // HEADERS
        if (printOut) {
            System.out.println("==== " + directionLabel + ": " + path + " ====");
            System.out.println(firstLine);
        }
        else {
            System.out.println("==== [SKIPPED] " + directionLabel + ": " + path + " ====");
        }
        out.write((firstLine + "\r\n").getBytes("UTF-8"));

        return printOut;
    }

    private static void possiblyForwardHeader(String line, String[] headersToRemove, OutputStream out, boolean printOut) throws IOException {
        boolean hideHeader = (headersToRemove != null)
                && Arrays.stream(headersToRemove).anyMatch(h->line.toLowerCase().contains(h.toLowerCase()));

        if (printOut) {
            System.out.println((hideHeader ? "[REMOVED] " : "") + line);
        }
        
        // forward to other side
        if (!hideHeader) {
            out.write((line + "\r\n").getBytes("UTF-8"));
        }
    }

    private static void sendInjectedHeaders(String[] headersToAdd, InputStream in, OutputStream out, boolean printOut) throws UnsupportedEncodingException, IOException {
        if (headersToAdd != null) {
            for (String injected : headersToAdd) {
                if (printOut) {
                    System.out.println("[ADDED] " + injected);
                }

                out.write((injected + "\r\n").getBytes("UTF-8"));
            }
        }
    }

    private static void forwardEmptyLine(OutputStream out, boolean printOut) throws IOException {
        if (printOut) {
            System.out.println();
        }
        out.write("\r\n".getBytes("UTF-8"));
        out.flush();
    }

    private static boolean forwardBinaryChunk(InputStream in, OutputStream out, boolean printOut) throws IOException {
        String line = HttpUtils.readLine(in);
        out.write((line + "\r\n").getBytes("UTF-8"));
        int chunkBytes = Integer.parseInt(line, 16);
        if (chunkBytes == 0) {
            line = HttpUtils.readLine(in); // skip empty line
            out.write("\r\n".getBytes("UTF-8"));
            return false;
        }
        forwardRawBytes(in, out, chunkBytes, printOut);
        HttpUtils.readLine(in); // skip empty line
        out.write("\r\n".getBytes("UTF-8"));
        return true;
    }

    private static void forwardRawBytes(InputStream in, OutputStream out, int toRead, boolean printOut) throws IOException {
        byte[] buffer = new byte[4096];
        boolean firstChunk = true;
        while (toRead > 0) {
            int bytesRead = in.read(buffer, 0, Math.min(toRead, buffer.length));
            if (bytesRead == -1) {
                break;
            }
            if (firstChunk) {
                if (printOut) {
                    printFirstNBodyBytes(buffer, bytesRead, MAX_PREVIEW_BYTES);
                }
                firstChunk = false;
            }
            out.write(buffer, 0, bytesRead);
            out.flush();
            toRead -= bytesRead;
        }
    }

    private static final int PREVIEW_BYTES_PER_LINES = 16;
    private static void printFirstNBodyBytes(byte[] buffer, int bytesRead, int maxPreviewBytes) {
        int limit = Math.min(maxPreviewBytes, bytesRead);
        System.out.println("BODY PREVIEW: ");

        int previewedBytes = 0;
        while (previewedBytes < limit) {
            int bytesToShowOnLine = Math.min(limit, PREVIEW_BYTES_PER_LINES);
            for (int i = 0; i < bytesToShowOnLine; ++i) {
                System.out.printf("%02X ", buffer[previewedBytes + i]);
            }
            for (int i = bytesToShowOnLine; i < PREVIEW_BYTES_PER_LINES; ++i) { // pad with spaces
                System.out.print("   ");
            }
            for (int i = 0; i < bytesToShowOnLine; i++) {
                System.out.print(Character.isISOControl(buffer[previewedBytes+i]) ? '?' : (char)buffer[previewedBytes+i]);
            }
            System.out.println();
            previewedBytes += bytesToShowOnLine;
        }

        System.out.println();
    }
}
