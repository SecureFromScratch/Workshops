import multer from "multer";

export const ALLOWED_TYPES = { 
  'image/jpeg': ['.jpg', '.jpeg'], 
  'image/png': ['.png'], 
  'image/gif': ['.gif'],
  'image/webp': ['.webp'], 
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
      const err = tryFindMetadataErrors(file);
      cb(err, !err);
  },
  limits: { 
    fileSize: 5 * 1024 * 1024, 
    files: 1,
    fields: 5,
    fieldSize: 8192, 
  }, 
});

function tryFindMetadataErrors(file) {
  if (!ALLOWED_TYPES[file.mimetype]) {
    return new Error('Invalid MIME type!');
  }
  
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_TYPES[file.mimetype].includes(ext)) {
    return new Error('File extension does not match MIME type!');
  }

  return null;
}
