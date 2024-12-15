import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    couponCode: { type: String, required: true, unique: true },
    recipeId: { type: String, required: true },
    redeemTime: { type: Date, default: null },  // Tracks when the coupon was redeemed
    redeemedBy: { type: String, default: null }, // Tracks the user who redeemed the coupon
  });
  
  const Coupon = mongoose.model('Coupon', couponSchema);
  export default Coupon;
  