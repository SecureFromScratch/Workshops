import sessionVerifier from '../middleware/sessionVerifier.js'; 
import { getAllRecipes, addRecipe, addRecipeWithImageUrl } from '../controllers/recipesController.js';
import upload from '../middleware/uploadsStorage.js'

export default function registerRoutes(router) { 
    router.get('/api/recipes', sessionVerifier, getAllRecipes);
    router.post('/api/addRecipe', sessionVerifier, upload.single('image'), addRecipe);
    router.post('/api/addRecipeWithUrl', sessionVerifier, addRecipeWithImageUrl);
}
