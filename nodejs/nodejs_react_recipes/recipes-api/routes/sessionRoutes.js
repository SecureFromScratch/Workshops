import { register, login, logout, isLoggedIn } from '../controllers/sessionController.js';
import sessionVerifier from '../middleware/sessionVerifier.js'; 

export default function registerRoutes(router) { 
    router.post('/api/register', register);
    router.post('/api/login', login);
    router.post('/api/logout', sessionVerifier, logout);
    router.get('/api/check-auth', isLoggedIn);
}
