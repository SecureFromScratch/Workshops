import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
      const err = null; // assign new Error("...") if you need to return an error
      cb(err, !err);
  },
  limits: { 
  }, 
});
