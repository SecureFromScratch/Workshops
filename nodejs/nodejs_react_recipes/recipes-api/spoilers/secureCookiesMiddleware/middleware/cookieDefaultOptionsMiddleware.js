const cookieDefaults = {
    httpOnly: true,
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production', // Secure in production
};

export default function cookieDefaultOptionsMiddleware(req, res, next) {
    const originalCookieFunc = res.cookie.bind(res);
    res.cookie = (name, value, options = {}) => {
        // Merge default options with specific cookie options
        const mergedOptions = { ...cookieDefaults, ...options };

        // Log warning if `secure` is disabled
        if (!mergedOptions.secure) {
            console.warn(
                `Warning: Cookie "${name}" is set without 'secure: true'. ` +
                `Make sure to use HTTPS in production.`
            );
        }

        return originalCookieFunc(name, value, mergedOptions);
    };
    next();
}
