import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..", "..");

export const buildProductImageURL = (filename) =>
  `/static/uploads/products/${filename}`;

export const resolveStaticPath = (staticPath = "") => {
  const cleaned = staticPath.replace(/\?.*$/, "").replace(/^\/+/, "");
  if (cleaned.startsWith("static/")) {
    const relative = cleaned.replace(/^static\//, "");
    return path.join(rootDir, relative);
  }
  return path.join(rootDir, cleaned);
};

export const removeFileIfExists = (staticPath) => {
  if (!staticPath) return;
  const filePath = resolveStaticPath(staticPath);
  fs.promises
    .access(filePath, fs.constants.F_OK)
    .then(() => fs.promises.unlink(filePath).catch(() => null))
    .catch(() => null);
};
