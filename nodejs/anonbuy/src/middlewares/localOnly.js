export function localOnly(req, res, next) {
  const raw = req.ip || req.socket?.remoteAddress || "";
  const ip = raw.replace(/^::ffff:/, ""); // normalize IPv4-mapped IPv6
  if (ip === "127.0.0.1" || ip === "::1") return next();
  return res.status(403).type("text/plain").send("Forbidden");
}
