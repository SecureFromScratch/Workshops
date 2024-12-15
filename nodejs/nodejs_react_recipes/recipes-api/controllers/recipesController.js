import Recipe from '../models/recipeModel.js';
import path from 'path';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import { combineButExclude } from '../objutils.js'
import { summarizeVotes } from './tagsController.js'
import logger from '../logger.js'
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import axios from 'axios'

async function detectMimeType(imagePath, imageBuffer) {
  const fileType = await fileTypeFromBuffer(imageBuffer);

  if (fileType) {
    //console.log(`MIME Type: ${fileType.mime}`); // Example: "image/png"
    //console.log(`File Extension: ${fileType.ext}`); // Example: "png"
    return (imagePath.toLowerCase().endsWith('.svg') && fileType.mime == "application/xml")
      ? "image/svg+xml"
      : fileType.mime;
  } else {
    console.error('Unable to determine the MIME type.');
    return null;
  }
}

async function prepImageDataForResponse(recipe) {
  if (!recipe.imagePath) {
    return null;
  }

  let imagePath = path.join(process.cwd(), recipe.imagePath); // Assuming `imageName` field contains the file name
  if (!fs.existsSync(imagePath)) {
    imagePath = path.join(process.cwd(), 'assets/images', recipe.imagePath); // Assuming `imageName` field contains the file name
  }

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const mimetype = await detectMimeType(imagePath, imageBuffer);
    const base64Image = imageBuffer.toString('base64')
    return `data:${mimetype};base64,${base64Image}`;
  } catch (error) {
    console.error(`Error loading image for recipe ${recipe.name}:`, error);
    return null;
  }
}
// Fetch all recipes
export async function getAllRecipes(req, res) {
  try {
    const recipes = await Recipe.find();
    //req.query.__proto__.file = "'carrot-cake.png'";
    
    const fieldsToExclude = [ '_id', '__v', 'taggedBy' ];
    const recipesWithImages = await Promise.all(
      recipes
        //.filter((recipe) => req.isSubscribed || !recipe.isPremium)
        .map(async (recipe) => {
          let base64Image = !req.noImages && await prepImageDataForResponse(recipe);
          const blockInstructions = recipe.isPremium && !req.isSubscribed;
          return combineButExclude(
            recipe.toObject(), 
            { base64Image }, // Include Base64 string with MIME type
            { tags: summarizeVotes(recipe.taggedBy) },
            { myVotes: recipe.taggedBy[req.user] || {}},
            fieldsToExclude,
            blockInstructions ? ['instructions'] : [],
          );
      })
    );

    res.json(recipesWithImages);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching recipes' });
  }
};

// Add a single recipe
export async function addRecipe(req, res) {
  try {
    const recipe = new Recipe(
      combineButExclude(
        { id: crypto.randomUUID(), }, 
        req.file ? { imagePath: `assets/images/${req.file.filename}` } : {},
        req.body
      )
    );
    await recipe.save();

    res.status(201).json({ message: 'Recipe added successfully', recipe });
  } catch (err) {
    res.status(500).json({ error: 'Error saving recipe' });
  }
};

// Add multiple recipes
export async function addRecipeWithImageUrl(req, res) {
  const { name, instructions, imageUrl, isPremium } = req.body;
  
  try {
    const imagePath = await downloadImageFile(imageUrl);
    const recipe = new Recipe({ id: crypto.randomUUID(), name, instructions, isPremium, imagePath });
    await recipe.save();
    res.status(201).json({ message: 'Recipe added successfully', recipe });
  } catch (err) {
    res.status(500).json({ error: 'Error saving recipe' });
  }
};

async function downloadImageFile(imageUrl) {
  const uploadsDir = path.join(process.cwd(), 'assets/images');

  try {
    const fileName = `${randomUUID()}_${path.basename(new URL(imageUrl).pathname)}`;
    const filePath = path.join(uploadsDir, fileName);

    const response = await axios({ method: 'get', url: imageUrl, responseType: 'stream', });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Wait for the download to finish
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return path.relative(process.cwd(), filePath); // Return the saved file path
  } catch (error) {
    logger.error('Error downloading the image:', error.message);
    throw new Error('Failed to download image');
  }
}
