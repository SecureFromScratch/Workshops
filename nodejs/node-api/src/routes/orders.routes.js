import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import { validateBuy } from "../middlewares/validateBuy.js";
import { buy } from "../controllers/orders.controller.js";
import { validateCoupon } from "../middlewares/validateCoupon.js";
import { redeem } from "../controllers/orders.controller.js";




const r = Router();
r.post("/buy", validateBuy, asyncHandler(buy));
r.post("/redeem-coupon", validateCoupon, asyncHandler(redeem));


export default r;
