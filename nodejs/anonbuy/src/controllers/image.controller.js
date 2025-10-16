import { createReadStream } from "fs";
import { access } from "fs/promises";
import { constants as FS } from "fs";
import path from "path";
import { PUBLIC_DIR } from "../config/env.js";

const IMAGES_DIR = path.resolve(PUBLIC_DIR, "images");
const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);

export async function getByFilename(req, res) {
   const { filename } = req.params;

   // Basic filename allowlist
   if (!/^[A-Za-z0-9._-]+$/.test(filename)) {
      return res.status(400).json({ error: "Invalid filename" });
   }

   const candidate = path.resolve(path.join(IMAGES_DIR, filename));

   // Ensure path stays inside IMAGES_DIR
   if (!candidate.startsWith(IMAGES_DIR + path.sep)) {
      return res.status(400).json({ error: "Invalid path" });
   }

   // Extension allowlist
   const ext = path.extname(candidate).toLowerCase();
   if (!ALLOWED_EXT.has(ext)) {
      return res.status(415).json({ error: "Unsupported file type" });
   }

   try {
      await access(candidate, FS.R_OK);

      // Content type by extension
      res.type(ext);

      // Safe caching for static assets
      res.setHeader("Cache-Control", "public, max-age=86400, immutable");
      res.setHeader("X-Content-Type-Options", "nosniff");

      // Stream the file
      const stream = createReadStream(candidate);
      stream.on("error", () => res.sendStatus(500));
      stream.pipe(res);
   } catch {
      res.sendStatus(404);
   }
}
