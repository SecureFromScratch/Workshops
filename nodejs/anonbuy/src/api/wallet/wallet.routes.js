import { Router } from "express";
import asyncHandler from "../../middlewares/asyncHandler.js";
import * as ctrl from "./wallet.controller.js";

const r = Router();
r.get("/balance/:code", asyncHandler(ctrl.balance));
r.post("/withdraw", asyncHandler(ctrl.withdraw));

export default r;
