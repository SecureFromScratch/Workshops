export default async function sessionVerifier(req, res, next) {
    req.user = 'Avi';
    req.isSubscribed = true;

    next();
}
