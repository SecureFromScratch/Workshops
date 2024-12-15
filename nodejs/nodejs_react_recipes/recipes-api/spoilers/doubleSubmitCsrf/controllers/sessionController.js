import srcRootOfUnchanged from '../srcRootOfUnchanged.js'

const { default: Session } = await import(srcRootOfUnchanged + '../models/sessionModel.js');
const { default: RegisteredUser } = await import(srcRootOfUnchanged + '../models/registeredUserModel.js');
import { v4 as uuidv4 } from 'uuid';
const { getSession } = await import(srcRootOfUnchanged + '../storage/sessionUtils.js');
const { combineButExclude } = await import(srcRootOfUnchanged + '../objutils.js');
import { generateToken } from '../middleware/doubleSubmitCsrf.js'

export async function register(req, res) {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const userInfo = await RegisteredUser.findOne({ username });
    if (userInfo) {
        return res.status(401).json({ error: 'Username already registered' });
    }

    const registration = new RegisteredUser({ username });
    await registration.save();

    return await continueWithLogin(username, res);
}

export async function login(req, res) {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    return await continueWithLogin(username, res);
}

async function continueWithLogin(username, res) {    
    const userInfo = await RegisteredUser.findOne({ username });
    if (!userInfo) {
        return res.status(401).json({ error: 'Username not allowed' });
    }

    const sessionId = uuidv4();
    const expiration = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now

    const session = new Session(
        combineButExclude(
            { sessionId, expiration },
            userInfo.toObject(),
            [ '_id' ]
        )            
    );
    await session.save();

    // Set session ID in a secure cookie
    res.cookie('sessionId', sessionId, {
        maxAge: 3 * 60 * 60 * 1000, // 3 hours
    });
  
    res.json({ success: true, message: 'Logged in successfully', username: session.username });
};

export async function logout(req, res) {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
      return res.status(400).json({ error: 'No session ID to log out' });
    }
  
    // Remove session from the database
    await Session.deleteOne({ sessionId });
  
    // Clear the session cookie
    res.clearCookie('sessionId', {
        httpOnly: true,
        //secure: true, // Match your cookie options
        sameSite: 'Strict',
    });
  
    res.json({ message: 'Logged out successfully' });
};

export async function isLoggedIn(req, res) {
    const csrfToken = generateToken(req, res, true);
    const session = await getSession(req.cookies.sessionId)
    if (session) {
        res.json({ authenticated: true, username: session.username, csrfToken });
    }
    else {
        res.json({ authenticated: false, csrfToken });
    }
};
 