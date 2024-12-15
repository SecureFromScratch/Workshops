import { getAllRecipes } from '../controllers/recipesController.js';
import internalAccessOnly from '../middleware/localhostRestrictor.js';

export default function registerRoutes(router) { 
    router.get('/internal/recipes', internalAccessOnly, getAllRecipes);
}
