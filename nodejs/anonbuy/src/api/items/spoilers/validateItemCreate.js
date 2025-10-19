import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { validateExternalImageUrl } from "../../security/url-guard.js";
import { ALLOWED_TYPES } from "./upload.js";

// src/middlewares/validations/validateItemCreate.js
const ItemCreateSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  active: z.coerce.boolean().default(true),
  imageUrl: z.string().trim().url().max(2048)
    .optional(),
});


export async function validateItemCreate(req, res, next) {
  try {
    // fields from multipart (after multer)
    const parsed = ItemCreateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid body",
        details: parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message })),
      });
    }
    res.locals.itemData = parsed.data; // sanitized payload
    
    // optional file checks (magic bytes)
    if (req.file) {
      const detected = await fileTypeFromBuffer(req.file.buffer);
      if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
        return res.status(400).json({ error: "Unsupported or fake file type" });
      }

      res.locals.filemeta = { 
        mimetype: detected.mime,
        ext: detected.ext 
      };
    }
    next();
  } catch (e) {
    next(e);
  }
}
