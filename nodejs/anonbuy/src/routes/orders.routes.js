import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import { validateSetOrder } from "../middlewares/validateOrder.js";
import { currentOrder, setOrder } from "../controllers/orders.controller.js";
import { validateCoupon } from "../middlewares/validateCoupon.js";
import { redeem } from "../controllers/orders.controller.js";

const r = Router();
r.get("/current", asyncHandler(currentOrder));
r.post("/change", validateSetOrder, asyncHandler(setOrder));
r.post("/redeem-coupon", validateCoupon, asyncHandler(redeem));

export default r;
