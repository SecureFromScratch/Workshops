  import mongoose from 'mongoose';

  const recipeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    instructions: { type: String, required: true },
    imagePath: { type: String },
    taggedBy: { type: Object, of: Object, default: {}, }, // NOTE: Using a Map would have been much safer
    isPremium: { type: Boolean, default: false },
  }, { strict: false });

  export default mongoose.model('Recipe', recipeSchema);
