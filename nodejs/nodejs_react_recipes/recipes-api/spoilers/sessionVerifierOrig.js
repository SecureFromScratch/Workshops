import { getSession } from "../storage/sessionUtils.js";

// Middleware to verify session
export default async function sessionVerifier(req, res, next) {
    const host = req.hostname; // Extract hostname from the request

    // Allow requests from localhost (127.0.0.1 or ::1 for IPv6) as user Avi
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
        req.user = "Avi";
        return next(); // Allow the request
    }

    const sessionId = req.cookies.sessionId;

    const sessionInfo = await getSession(sessionId);
    if (!sessionInfo) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
    }

    req.user = sessionInfo.username; // Attach user info for later use
    if (sessionInfo.isSubscribed) {
        req.isSubscribed = true;
    }

    next();
}
