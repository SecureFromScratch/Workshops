import { redeemCoupon } from '../controllers/couponController.js';
import sessionVerifier from '../middleware/sessionVerifier.js'; 

export default function registerRoutes(router) { 
    router.post('/api/redeem', sessionVerifier, redeemCoupon);
}
