import srcRootOfUnchanged from '../srcRootOfUnchanged.js'

const { default: sessionVerifier } = await import(srcRootOfUnchanged + '../middleware/sessionVerifier.js');
const { getAllRecipes, addRecipe, addRecipeWithImageUrl }  = await import(srcRootOfUnchanged + '../controllers/recipesController.js');
import logger from '../../../logger.js'
import upload from '../middleware/uploadsStorage.js'
import { fileTypeFromBuffer } from 'file-type';
import path from 'path';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';

async function generateUniqueName(directory, filename) {
  while (true) {
    const uniqueName = randomUUID() + '_' + filename;
    const uniquePath = path.join(directory, uniqueName);
    try {
      await fs.access(uniquePath);
    } catch (ignore) { 
      return uniquePath;
    }
  }
}

async function addRecipeFileVerificationWrapper(req, res) {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded!');
  }
  const fileBuffer = file.buffer; // Complete file content in memory
  const actualFileType = await fileTypeFromBuffer(fileBuffer);
  if (!actualFileType) {
    logger.warn(`File metadata ${file.mimetype} does not match a known actual file type`);
    throw new Error('File content does not match expected MIME type!');
  }
  else if (actualFileType.mime !== file.mimetype) {
    logger.warn(`File metadata ${file.mimetype} does not match actual file type ${actualFileType.mime}`);
    throw new Error('File content does not match expected MIME type!');
  }
  
  const savePath = await generateUniqueName(path.join(process.cwd(), 'assets/images'), file.originalname);
  await fs.writeFile(savePath, file.buffer);

  return await addRecipe(req, res);
}

export default function registerRoutes(router) { 
    router.get('/api/recipes', sessionVerifier, getAllRecipes);
    router.post('/api/addRecipe', sessionVerifier, upload.single('image'), addRecipeFileVerificationWrapper);
    router.post('/api/addRecipeWithUrl', sessionVerifier, addRecipeWithImageUrl);
}
