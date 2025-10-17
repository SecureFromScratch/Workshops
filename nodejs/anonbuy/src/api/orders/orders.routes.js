import { Router } from "express";
import asyncHandler from "../../middlewares/asyncHandler.js";
import { validateSetOrder } from "../../middlewares/validations/validateOrder.js";
import { currentOrder, setOrder } from "./orders.controller.js";
import { validateCouponRedeem, validateCouponRemove } from "../../middlewares/validations/validateCoupon.js";
import { redeemCoupon, removeCoupon } from "./orders.controller.js";

const r = Router();
r.get("/:walletCode", asyncHandler(currentOrder));
r.post("/change", validateSetOrder, asyncHandler(setOrder));
r.post("/redeem-coupon", validateCouponRedeem, asyncHandler(redeemCoupon));
r.post("/remove-coupon", validateCouponRemove, asyncHandler(removeCoupon));

export default r;
