import { adjustTagVote } from '../controllers/tagsController.js';
import sessionVerifier from '../middleware/sessionVerifier.js'; 

export default function registerRoutes(router) { 
    router.post('/api/tagVote', sessionVerifier, adjustTagVote);
}
