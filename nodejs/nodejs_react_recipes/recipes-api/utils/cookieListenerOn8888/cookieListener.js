import http from 'http';
import fs from 'fs';
import path from 'path';

class SimpleHttpServer {
    constructor(prefixes, baseDirectory) {
        if (!prefixes || prefixes.length === 0) {
            throw new Error("Prefixes are required.");
        }
        if (!fs.existsSync(baseDirectory)) {
            throw new Error("Invalid directory.");
        }

        this.prefixes = prefixes;
        this.baseDirectory = baseDirectory;
    }

    start() {
        const server = http.createServer((req, res) => this.processRequest(req, res));

        const port = new URL(this.prefixes[0]).port || 8888;
        server.listen(port, () => {
            console.log(`Listening on ${this.prefixes[0]}`);
        });
    }

    processRequest(req, res) {
        console.log(`Request received:`);
        console.log(`  Method: ${req.method}`);
        console.log(`  URL: ${req.url}`);
        console.log(`  Headers:`);
        for (const [key, value] of Object.entries(req.headers)) {
            console.log(`    ${key}: ${value}`);
        }

        const filename = path.basename(req.url);
        const filePath = path.join(this.baseDirectory, filename);

        if (fs.existsSync(filePath)) {
            res.writeHead(200, { "Content-Type": "text/html" });
            fs.createReadStream(filePath).pipe(res).on('error', () => {
                res.writeHead(500);
                res.end("Internal Server Error");
            });
        } else {
            res.writeHead(404);
            res.end("File Not Found");
        }
    }
}

const server = new SimpleHttpServer(["http://localhost:8888/"], ".");
console.log("Starting server on localhost:8888");
server.start();
