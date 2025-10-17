import { Router } from "express";
import asyncHandler from "../../middlewares/asyncHandler.js";
import * as ctrl from "./wallet.controller.js";

const r = Router();
r.post("/redeem", asyncHandler(ctrl.redeem));
r.get("/balance/:userId", asyncHandler(ctrl.balance));

export default r;
