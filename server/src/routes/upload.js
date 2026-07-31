import { Router } from "express";
import multer from "multer";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { badRequest } from "../utils/apiError.js";
import { v2 as cloudinary } from "cloudinary";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

// Configure Cloudinary only if all three credentials are present
const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Keep files in memory — we stream them to Cloudinary or write to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WebP, or GIF images are accepted."));
    }
  },
});

// POST /api/upload — admin only
// Uploads to Cloudinary when credentials are available, falls back to local disk
router.post("/", requireAuth, requireAdmin, (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) return next(badRequest(err.message));
    if (!req.file) return next(badRequest("No image file was included in the request."));

    try {
      if (hasCloudinary) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "bloomsage", resource_type: "image" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(req.file.buffer);
        });
        return res.json({ url: result.secure_url });
      }

      // Local fallback — only used in dev, Vercel's filesystem is read-only
      const uploadsDir = path.join(__dirname, "..", "..", "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
      res.json({ url: `/uploads/${filename}` });
    } catch (uploadErr) {
      next(badRequest("Upload failed: " + uploadErr.message));
    }
  });
});

export default router;
