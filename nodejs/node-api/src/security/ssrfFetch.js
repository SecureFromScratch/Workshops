import https from "node:https";
import http from "node:http";
import dns from "node:dns/promises";
import net from "node:net";
import { toASCII } from "punycode";

const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

function isPrivateIp(ip) {
  if (net.isIP(ip) === 0) return true;                   // not an IP
  if (ip === "127.0.0.1" || ip === "::1") return true;  // loopback
  // IPv6 link-local/site-local
  if (ip.toLowerCase().startsWith("fe80:") || ip.toLowerCase().startsWith("fec0:")) return true;
  // IPv4 ranges
  const b = ip.split(".").map(Number);
  return b.length === 4 && (
    b[0] === 10 ||
    (b[0] === 172 && b[1] >= 16 && b[1] <= 31) ||
    (b[0] === 192 && b[1] === 168) ||
    (b[0] === 169 && b[1] === 254)
  );
}

async function resolvePublicIps(hostname) {
  const [a4, a6] = await Promise.allSettled([dns.resolve4(hostname), dns.resolve6(hostname)]);
  const ips = [
    ...(a4.status === "fulfilled" ? a4.value : []),
    ...(a6.status === "fulfilled" ? a6.value : []),
  ];
  if (ips.length === 0) throw new Error("DNS resolution failed");
  const publicIps = ips.filter(ip => !isPrivateIp(ip));
  if (publicIps.length === 0) throw new Error("All DNS results are private/loopback");
  return publicIps;
}

function assertHttpsOnly(u) {
  if (u.protocol !== "https:") throw new Error("Only HTTPS is allowed");
  if (u.username || u.password) throw new Error("Credentials not allowed");
  if (u.port && u.port !== "443") throw new Error("Non-443 ports not allowed");
}

export async function ssrfFetch(urlString, {
  method = "GET",
  headers = {},
  body = undefined,
  maxRedirects = 3,
  headerTimeoutMs = 5000,
  bodyTimeoutMs = 10000,
  maxBytes = 5 * 1024 * 1024, // 5MB
  allowHosts = null,          // e.g., new Set(["images.example-cdn.com"])
} = {}) {
  let current = new URL(urlString);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    assertHttpsOnly(current);

    const hostAscii = toASCII(current.hostname).toLowerCase();
    if (net.isIP(hostAscii)) throw new Error("IP literals not allowed");
    if (allowHosts && !allowHosts.has(hostAscii)) throw new Error("Host not allowed");

    // Resolve and pin to a public IP
    const ips = await resolvePublicIps(hostAscii);
    const pinnedIp = ips[0]; // simple policy; you can randomize/rotate if you want

    const requestHeaders = {
      ...headers,
      Host: hostAscii, // preserve virtual host
    };

    const client = current.protocol === "https:" ? https : http;
    const options = {
      protocol: current.protocol,
      method,
      host: pinnedIp,                 // connect by IP
      port: current.port || (current.protocol === "https:" ? 443 : 80),
      path: current.pathname + (current.search || ""),
      headers: requestHeaders,
      servername: hostAscii,          // SNI for TLS + hostname cert validation
      timeout: headerTimeoutMs,
      // Reject invalid certs (default true); keep as-is for security
    };

    const { statusCode, headers: resHeaders, bodyBuffer } = await new Promise((resolve, reject) => {
      const req = client.request(options, (res) => {
        let received = 0;
        const chunks = [];

        const bodyTimer = setTimeout(() => {
          req.destroy(new Error("Body timeout"));
        }, bodyTimeoutMs);

        res.on("data", (chunk) => {
          received += chunk.length;
          if (received > maxBytes) {
            clearTimeout(bodyTimer);
            req.destroy(new Error("Response too large"));
            return;
          }
          chunks.push(chunk);
        });

        res.on("end", () => {
          clearTimeout(bodyTimer);
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            bodyBuffer: Buffer.concat(chunks),
          });
        });
      });

      req.on("timeout", () => {
        req.destroy(new Error("Header timeout"));
      });

      req.on("error", reject);

      if (body) {
        if (typeof body === "string" || Buffer.isBuffer(body)) {
          req.write(body);
        } else {
          reject(new Error("Unsupported body type"));
          return;
        }
      }
      req.end();
    });

    if (REDIRECT_CODES.has(statusCode) && resHeaders.location) {
      // Follow redirect with full re-validation
      const next = new URL(resHeaders.location, current);
      // Disallow scheme/port changes along the chain
      if (next.protocol !== "https:") throw new Error("Redirect to non-HTTPS blocked");
      if (next.port && next.port !== "443") throw new Error("Redirect to non-443 port blocked");
      current = next;
      method = (statusCode === 303) ? "GET" : method; // standard redirect semantics
      body = (statusCode === 303) ? undefined : body;
      continue;
    }

    return {
      status: statusCode,
      headers: resHeaders,
      body: bodyBuffer,
    };
  }

  throw new Error("Too many redirects");
}
