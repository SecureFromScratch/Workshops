import { Router } from "express";
import asyncHandler from "../../middlewares/asyncHandler.js";
import { validateSetOrder } from "../../middlewares/validations/validateOrder.js";
import { currentOrder, setOrder } from "./orders.controller.js";
import { validateCoupon } from "../../middlewares/validations/validateCoupon.js";
import { redeem } from "./orders.controller.js";

const r = Router();
r.get("/:idempotencyKey", asyncHandler(currentOrder));
r.post("/change", validateSetOrder, asyncHandler(setOrder));
r.post("/redeem-coupon", validateCoupon, asyncHandler(redeem));

export default r;
