import multer from 'multer';
import path from 'path';
import sessionVerifier from '../middleware/sessionVerifier.js'; 
import { getAllRecipes, addRecipe, addRecipeWithImageUrl } from '../controllers/recipesController.js';

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'assets/images');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

export default function registerRoutes(router) { 
    router.get('/api/recipes', sessionVerifier, getAllRecipes);
    router.post('/api/addRecipe', sessionVerifier, upload.single('image'), addRecipe);
    router.post('/api/addRecipeWithUrl', sessionVerifier, addRecipeWithImageUrl);
}
