export default function internalAccessOnly(req, res, next) {
    const host = req.hostname; // Extract hostname from the request

    // Allow requests from localhost (127.0.0.1 or ::1 for IPv6)
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
        req.user = "~~~InternalNetwork";
        req.noImages = true;
        return next(); // Allow the request
    }

    // Deny requests from other hosts
    res.status(403).json({ error: 'Access denied. This route is only accessible via localhost.' });
}
