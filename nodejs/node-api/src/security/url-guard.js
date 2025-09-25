import dns from "node:dns/promises";
import net from "node:net";
import { domainToASCII } from "node:url";



const ALLOWED_HOSTS = new Set([
  "images.example-cdn.com",
  "static.example.com",
]);

function isPrivate(ip) {
  if (net.isIP(ip) === 0) return true;
  if (ip === "127.0.0.1" || ip === "::1") return true;
  if (ip.startsWith("fe80:") || ip.startsWith("fec0:")) return true;
  const b = ip.split(".").map(Number);
  return b.length === 4 && (
    b[0] === 10 ||
    (b[0] === 172 && b[1] >= 16 && b[1] <= 31) ||
    (b[0] === 192 && b[1] === 168) ||
    (b[0] === 169 && b[1] === 254)
  );
}

async function assertPublicDns(host) {
  const [a4, a6] = await Promise.allSettled([dns.resolve4(host), dns.resolve6(host)]);
  const ips = [
    ...(a4.status === "fulfilled" ? a4.value : []),
    ...(a6.status === "fulfilled" ? a6.value : []),
  ];
  if (ips.length === 0) throw new Error("DNS resolution failed");
  if (ips.some(isPrivate)) throw new Error("Resolves to private/loopback IP");
}

export async function validateExternalImageUrl(raw) {
  if (raw == null) return null;

  let url;
  try { url = new URL(String(raw)); } catch { throw new Error("Invalid URL"); }

  //if (url.protocol !== "https:") throw new Error("Only HTTPS allowed");
  if (url.username || url.password) throw new Error("Credentials not allowed");
  //if (url.port && url.port !== "443") throw new Error("Port not allowed");

  const host = domainToASCII(url.hostname).toLowerCase();
  if (net.isIP(host)) throw new Error("IP literals not allowed");
  if (!ALLOWED_HOSTS.has(host)) throw new Error("Host not allowed");

  await assertPublicDns(host);

  if (!/^\/[A-Za-z0-9/_\-.%]*$/.test(url.pathname)) throw new Error("Invalid path");
  url.search = ""; url.hash = "";

  return url.toString();
}
