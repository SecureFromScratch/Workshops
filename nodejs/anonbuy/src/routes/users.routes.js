import { Router } from "express";
import * as ctrl from "../controllers/users.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const r = Router();
r.get("/", asyncHandler(ctrl.list));
r.post("/", asyncHandler(ctrl.create));
export default r;
