import { URL } from 'url';
import net from 'net';
import dns from 'dns';

/**
 * Checks if a given URL is allowed.
 * @param {string} url - The URL to validate.
 * @returns {Promise<boolean>} True if the URL is allowed, false otherwise.
 */
export default async function isPrivateNetworkUrl(url) {
    if (!url || !url.trim()) {
        return false;
    }

    try {
        const parsedUrl = new URL(url);
        const host = parsedUrl.hostname;

        // Check if the host is an IP address
        if (net.isIP(host)) {
            return !isPrivateIp(host);
        } else {
            // Resolve hostname to IP address(es)
            try {
                const addresses = await dns.promises.lookup(host, { all: true });

                // Check each resolved IP address
                for (const addr of addresses) {
                    if (isPrivateIp(addr.address)) {
                        return false; // Disallow if any IP is private
                    }
                }
                return true; // All IPs are public
            } catch (dnsErr) {
                return false; // Could not resolve host
            }
        }
    } catch (err) {
        if (err.code === 'ERR_INVALID_URL') {
            return false; // Not a valid URL
        }
        throw err; // Rethrow other unexpected errors
    }
}

/**
 * Determines if an IP address is private.
 * @param {string} ip - The IP address to check.
 * @returns {boolean} True if the IP is private, false otherwise.
 */
function isPrivateIp(ip) {
    if (net.isIPv4(ip)) {
        const octets = ip.split('.').map(Number);
        if (octets[0] === 10) { return true; /* Class A private network */ }
        if (octets[0] === 127) { return true; /* Loopback address */ }
        if (octets[0] === 169 && octets[1] === 254) { return true; /* Link-local address */ }
        if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) { return true; /* Class B private network */ }
        if (octets[0] === 192 && octets[1] === 168) { return true; /* Class C private network */ }
        return false; // Public IP
    } else if (net.isIPv6(ip)) {
        if (ip === '::1') { return true; /* Loopback address */ }
        if (ip.startsWith('fc') || ip.startsWith('fd')) { return true; /* Unique local addresses */ }
        return false; // Public IPv6 address
    }
    return false; // Not a valid IP
}
