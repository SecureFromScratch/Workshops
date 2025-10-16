import multer from "multer";

export const upload = multer({
   storage: multer.memoryStorage(),
   limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5MB, single file
   fileFilter: (req, file, cb) => {
       const ok = ["image/jpeg", "image/png", "application/pdf"].includes(file.mimetype);
       cb(ok ? null : new Error("Unsupported file type"), ok);
     },
});
