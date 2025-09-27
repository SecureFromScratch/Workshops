// routes/items.router.js
import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import * as ctrl from "../controllers/items.controller.js";
import { searchCriteria } from "../middlewares/searchCriteria.js";
import { applyPagination } from "../middlewares/pagination.js";  // ⬅️ import

import multer from "multer";
import { validateItemCreate } from "../middlewares/validateItemCreate.js";
import { upload } from "../middlewares/upload.js";


const r = Router();

//r.get("/search",  asyncHandler(ctrl.getByCriteria)); 
r.get("/search", searchCriteria , applyPagination,asyncHandler(ctrl.getByCriteria)); 



r.get("/", asyncHandler(ctrl.list));


// JSON (no file)
r.post("/create", validateItemCreate, asyncHandler(ctrl.create));


// Multipart (with file)
r.post(
  "/create-with-file",
  upload.single("file"),      // multer: memory storage, size limit, single file
  validateItemCreate,         // validates body → sets req.itemData
  asyncHandler(ctrl.createWithFile)
);

export default r;
