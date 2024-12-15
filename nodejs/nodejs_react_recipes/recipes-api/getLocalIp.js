import os from 'os'

// Get the local IP address of your machine
export default function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const forbiddenPrefixes = [ [ "192." ], [] ] // setup so on first pass we do not take interfaces starting with 192
  for (const forbiddenList of forbiddenPrefixes) {
    for (const iface of Object.values(interfaces)) {
      for (const config of iface || []) {
        if (config.family === "IPv4" && !config.internal && !startsWithAny(config.address, forbiddenList)) {
          console.log(`========${'='.repeat(config.address.length)}=============`);
          console.log(`= Using ${config.address} as host ip =`);
          console.log(`========${'='.repeat(config.address.length)}=============`);
          return config.address; // Return the first non-internal IPv4 address
        }
      }
    }
  }

  return '127.0.0.1'; // Fallback to localhost
}

function startsWithAny(str, prefixesList) {
  for (const prefix of prefixesList) {
    if (str.startsWith(prefix)) {
      return true; // skip this address
    }
  }
  return false;
}
