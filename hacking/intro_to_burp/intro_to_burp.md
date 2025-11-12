# Intro to Burp

## 🚀  Step 1: Download and Install Burp Suite




Download: Go to the official PortSwigger website and download the Burp Suite Community Edition. It's available for Windows, macOS, and Linux.

Install: Run the installer and follow the prompts. The installation is typically straightforward.

Launch: Start Burp Suite. When prompted for a project file, simply choose the default settings and click "Start Burp."




## 🛠️ Step 2: Configure Your Proxy




Burp Suite works as an "interception proxy," sitting between your browser and the web application. You need to configure your browser to send all its traffic through Burp.




### Option 1: Use Burp's Built-in Browser (Recommended for Beginners)




This is the simplest way. In Burp Suite, go to the Proxy tab, then the Intercept sub-tab.

Click the "Open Browser" button. This launches a dedicated, pre-configured Chromium browser that automatically routes traffic through Burp.




### Option 2: Configure an External Browser




Install a Proxy Switcher: For browsers like Firefox or Chrome, install an extension like FoxyProxy.

Set the Proxy: Configure the extension to use an HTTP Proxy on 127.0.0.1 and Port 8080.

Install the Certificate (Crucial for HTTPS):

In your Burp-configured browser, navigate to http://burp/ or http://127.0.0.1:8080/.

Click the link to download the CA Certificate.

Follow your browser's instructions to import this certificate as a trusted root authority. This allows Burp to decrypt and intercept HTTPS (secure) traffic.




## 🔍 Step 3: Learn the Core Tools (Community Edition)




As a student, you'll mainly be using these tabs, which are fully functional in the free Community Edition:

Burp Tool	Main Purpose	How Students Use It
Proxy	Intercept, view, and modify all HTTP/S requests and responses between your browser and the web server.	The most important tool. Use the Intercept tab to pause traffic and the HTTP History tab to review all past requests and responses.
Repeater	Manually modify and resend a single request multiple times to see how the server responds.	Manual testing backbone. Ideal for changing parameters, testing for SQL Injection, or trying different inputs quickly.
Intruder	Automate customized attacks with a set of defined payloads, great for brute-forcing, fuzzing, and enumeration.	Limited in Community. You can use it, but it runs very slowly to encourage Pro upgrades. Still useful for basic, small-scale testing.
Decoder	Manually or automatically transform encoded data (e.g., Base64, URL encoding, Hex).	Essential for analyzing encoded inputs, tokens, or data found in requests and responses.
Comparer	Perform a word-level or byte-level comparison of two items (requests or responses).	Useful for detecting subtle differences between a normal request and an attack request, or between two user sessions.




## 🎯 Step 4: Your First Task - Intercept and Modify a Request




Turn on Intercept: Go to the Proxy tab and ensure the "Intercept is on" button is toggled.

Browse: Use your Burp-configured browser to visit a safe, non-sensitive website (like a training environment such as the PortSwigger Web Security Academy).

Capture: The request will stop in Burp. You'll see the raw HTTP request details.

Forward or Drop:

Click "Forward" to send the request on its way to the server.

Click "Drop" to discard the request (the browser will time out).

Send to Repeater: Right-click the intercepted request and select "Send to Repeater" (or use the shortcut Ctrl+R).

Experiment in Repeater: Go to the Repeater tab. Change a parameter in the request (e.g., change a username or a number), click "Send," and analyze the Response tab. This is how you begin to find vulnerabilities!




## 💡 Step 5: Essential Learning Resources




The best place for students to practice with Burp Suite is:

PortSwigger Web Security Academy: This is run by the creators of Burp Suite and is 100% free. It offers structured learning paths, tutorials, and interactive labs for all major web vulnerabilities, and you can solve them using the Community Edition.





