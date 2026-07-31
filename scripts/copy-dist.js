/**
 * Copies client/dist → public/
 * Copies admin/dist  → public/admin/
 * This lets Vercel serve both as static files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source not found: ${src}`);
    process.exit(1);
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const publicDir = path.join(root, "public");

// Clear public dir
if (fs.existsSync(publicDir)) fs.rmSync(publicDir, { recursive: true });
fs.mkdirSync(publicDir);

// Copy client build → public/
console.log("Copying client/dist → public/");
copyDir(path.join(root, "client", "dist"), publicDir);

// Copy admin build → public/admin/
console.log("Copying admin/dist → public/admin/");
copyDir(path.join(root, "admin", "dist"), path.join(publicDir, "admin"));

console.log("Done! public/ is ready for Vercel static serving.");
