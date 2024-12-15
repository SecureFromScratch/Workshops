import Session from "../models/sessionModel.js"

export async function getSession(sessionId) {
    if (!sessionId) {
        return undefined;
    }

    const session = await Session.findOne({ sessionId });
    if (!session || session.expiration < new Date()) {
        return undefined;
    }

    return session;
}
