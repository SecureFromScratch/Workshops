// routes/items.router.js
import { Router } from "express";
import asyncHandler from "../../middlewares/asyncHandler.js";
import * as ctrl from "./items.controller.js";
import { searchCriteria } from "../../middlewares/searchCriteria.js";
import { applyPagination } from "../../middlewares/pagination.js";  // ⬅️ import

import multer from "multer";
import { validateItemCreate } from "../../middlewares/validations/validateItemCreate.js";
import { upload } from "../../middlewares/upload.js";


const r = Router();

r.get("/search",  asyncHandler(ctrl.getByCriteria)); 
r.get("/", asyncHandler(ctrl.list));

// JSON (no file)
r.post("/create", validateItemCreate, asyncHandler(ctrl.create));

export default r;
