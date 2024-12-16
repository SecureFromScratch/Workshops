import logger from '../logger.js'; // Import the logger
import Recipe from '../models/recipeModel.js';

export function summarizeVotes(data) {
    const summary = {};
  
    for (const user in data) {
        const tags = data[user];
        for (const tag in tags) {
            const vote = tags[tag].direction;
            summary[tag] = (summary[tag] || 0) + vote;
        }
    }
  
    return summary;
}
  
export async function adjustTagVote(req, res) {
    const { recipeId, votes } = req.body;

    // Validate the input
    if (!recipeId || !votes) {
        logger.warn('Invalid input for adjusting tag vote', { recipeId, vote });
        return res.status(400).json({ error: 'Missing recipeId or vote' });
    }

    try {
        // Find the recipe by ID
        const recipe = await Recipe.findOne({ 'id': recipeId });
        if (!recipe) {
            logger.warn(`Recipe not found for ID: ${recipeId}`);
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Adjust the tag vote
        if (!recipe.taggedBy[req.user]) {
            recipe.taggedBy[req.user] = votes;
        }
        else {
            Object.assign(recipe.taggedBy[req.user], votes);
        }
        
        recipe.markModified('taggedBy');
        await recipe.save();
        const updatedVotes = summarizeVotes(recipe.taggedBy);
        logger.info(`TaggedBy for recipe "${recipeId}" updated with votes ${votes}. New summary value: ${updatedVotes}`);
        return res.json({ message: 'Tag vote updated successfully', tags: updatedVotes, myVotes: recipe.taggedBy[req.user] });
    } catch (error) {
        logger.error(`Error adjusting tag vote for recipe "${recipeId}": ${error.message}`);
        res.status(500).json({ error: 'An error occurred while adjusting the tag vote' });
    }
}
