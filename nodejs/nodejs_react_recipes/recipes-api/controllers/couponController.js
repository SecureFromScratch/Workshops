import logger from '../logger.js'; // Import the logger
import Recipe from '../models/recipeModel.js';
import Coupon from '../models/couponModel.js';

export async function redeemCoupon(req, res) {
    const { couponCode } = req.body;
    const user = req.user; // Middleware adds this to the request when verifying sessionId
  
    if (!couponCode || !user) {
        logger.warn(`Redeem attempt failed: Missing couponCode or user`);
        return res.status(400).json({ error: 'Coupon code and user are required' });
    }
  
    try {
        logger.info(`User "${user}" is attempting to redeem coupon "${couponCode}"`);

        // Find the coupon
        const coupon = await Coupon.findOne({ couponCode });
        if (!coupon) {
            logger.warn(`Redeem attempt failed: Invalid coupon "${couponCode}" by user "${user}"`);
            return res.status(400).json({ error: 'Invalid coupon code' });
        }
  
        // Check if the coupon is already redeemed
        if (coupon.redeemTime || coupon.redeemedBy) {
            logger.warn(`Redeem attempt failed: Coupon "${couponCode}" already redeemed by user "${coupon.redeemedBy}"`);
            return res.status(400).json({ error: 'Coupon has already been redeemed' });
        }
  
        // Update the coupon as redeemed
        coupon.redeemTime = new Date();
        coupon.redeemedBy = user;
        await coupon.save();

       logger.info(`Coupon "${couponCode}" successfully redeemed by user "${user}"`);
  
        // Fetch the associated recipe
        const recipe = await Recipe.findOne({ recipeId: coupon.recipeId });
        if (!recipe) {
            logger.error(`Redemption failed: Recipe "${coupon.recipeId}" not found for coupon "${couponCode}"`);
            return res.status(400).json({ error: 'Recipe not found' });
        }
  
        res.json({ message: 'Coupon redeemed successfully', recipe });
    } catch (error) {
        logger.error(`Redemption failed: Server error for coupon "${couponCode}" by user "${user}": ${error.message}`);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
}
  