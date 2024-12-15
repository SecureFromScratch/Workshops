import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import logger from '../../../logger.js'

const allowedTypes = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
};

function validateMetadata(file) {
  // Validate MIME type from metadata
  if (!allowedTypes[file.mimetype]) {
    if (file.mimetype.startsWith('image/')) {
      logger.error(`Attempted upload of unsupported *image* type ${file.mimetype}`);
    }
    else {
      logger.warn(`Attempted upload of unsupported file type ${file.mimetype}`);
    }
    throw new Error('Invalid MIME type!');
  }

  // Validate file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes[file.mimetype].includes(ext)) {
    logger.warn(`Attempted upload of mismatched image extension ${ext} vs mimetype ${file.mimetype}`);
    throw new Error('File extension does not match MIME type!');
  }
}

/*const storage = multer.diskStorage({
  destination: path.join(process.cwd(), 'assets/images'),
  filename: (req, file, cb) => {
    cb(null, randomUUID() + '_' + file.originalname);
  },
});*/

export default multer({ 
  storage: multer.memoryStorage(), 
  fileFilter: async (req, file, cb) => {
    try {
      validateMetadata(file);

      cb(null, true);
    } catch (err) {
      const httpError = new Error(`Validation failed: ${err.message}`);
      httpError.status = 400;
      cb(httpError);
    } 
  },
  preservePath: true,
  limits: {
    fileSize: 2 * 1024 * 1024, // Limit file size to 2 MB
    files: 1,                 // Limit to 1 file per request
    fields: 5,                // Allow up to 5 non-file fields
    fieldSize: 8192,          // Limit each field size to 8 KB (assuming instructions are less than 8kb)
  },
});
