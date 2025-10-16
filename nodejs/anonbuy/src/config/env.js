import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Public dir built relative to", __dirname)

export const PUBLIC_DIR = path.join(__dirname, ".."/*config*/, ".."/*src*/, "public")
export const PORT = process.env.PORT || 3000;
