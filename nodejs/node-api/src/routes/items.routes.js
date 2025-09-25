import { Router } from "express";
import * as ctrl from "../controllers/items.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { searchCriteria } from "../middlewares/searchCriteria.js";
import multer from "multer";
import { validateItemCreate } from "../middlewares/validateItemCreate.js";
import { upload } from "../middlewares/upload.js";




const r = Router();
r.get("/", asyncHandler(ctrl.list));

r.get("/search",  asyncHandler(ctrl.getByCriteria)); 
 

// JSON (no file)
r.post("/create", validateItemCreate, asyncHandler(ctrl.create));




export default r;
