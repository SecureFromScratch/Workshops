import { Router } from "express";
import * as ctrl from "../controllers/items.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { searchCriteria } from "../middlewares/searchCriteria.js";
import multer from "multer";
import { validateItemCreate } from "../middlewares/validateItemCreate.js";

   const upload = multer({
     storage: multer.memoryStorage(),                 // <- keep file in memory buffer
     limits: { fileSize: 5 * 1024 * 1024 },
     fileFilter: (req, file, cb) => {
       const ok = ["image/jpeg", "image/png", "application/pdf"].includes(file.mimetype);
       cb(ok ? null : new Error("Unsupported file type"), ok);
     },
   });


const r = Router();
r.get("/", asyncHandler(ctrl.list));

r.get("/search",  asyncHandler(ctrl.getByCriteria)); 
 

// JSON (no file)
r.post("/create", validateItemCreate, asyncHandler(ctrl.create));



// Multipart (with file)
r.post("/create-with-file", upload.single("file"), validateItemCreate, asyncHandler(ctrl.createWithFile));

console.log({
  list: typeof ctrl.list,
  getByCriteria: typeof ctrl.getByCriteria,  
  createPlain: typeof ctrl.create,
  createWithFile: typeof ctrl.createWithFile,
});

export default r;
