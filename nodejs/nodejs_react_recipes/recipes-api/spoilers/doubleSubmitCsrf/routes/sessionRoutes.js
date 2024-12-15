import srcRootOfUnchanged from '../srcRootOfUnchanged.js'

import { register, login, logout, isLoggedIn } from '../controllers/sessionController.js';
const { default: sessionVerifier } = await import(srcRootOfUnchanged + '../middleware/sessionVerifier.js'); 
import { doubleCsrfProtection } from '../middleware/doubleSubmitCsrf.js'

export default function registerRoutes(router) { 
    router.post('/api/register', doubleCsrfProtection, register);
    router.post('/api/login', doubleCsrfProtection, login);
    router.post('/api/logout', sessionVerifier, logout);
    router.get('/api/check-auth', isLoggedIn);
}
