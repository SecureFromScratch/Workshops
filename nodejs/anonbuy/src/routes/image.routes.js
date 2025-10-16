import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import * as ctrl from "../controllers/image.controller.js";

const r = Router();
r.get("/:filename", asyncHandler(ctrl.getByFilename));

export default r;
