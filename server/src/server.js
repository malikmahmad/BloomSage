import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { runMigrations } from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import reviewRoutes from "./routes/reviews.js";
import wishlistRoutes from "./routes/wishlist.js";
import contactRoutes from "./routes/contact.js";
import uploadRoutes from "./routes/upload.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vercel sets this env var automatically — we use it to skip things
// that don't make sense in a serverless environment (logging, local uploads)
const isVercel = !!process.env.VERCEL;

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Only log in local dev — too noisy on serverless
if (!isVercel) app.use(morgan("dev"));

// Local uploads directory — only relevant outside Vercel since
// the Vercel filesystem is ephemeral and read-only after deploy
if (!isVercel) {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use("/uploads", express.static(uploadsDir));
}

// Simple health check — useful for uptime monitoring
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Mount all route modules
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes);

// Catch unknown /api/* routes before the SPA fallback
app.use("/api", notFoundHandler);

// When running locally or on a non-Vercel server, serve the built
// React apps from disk — Vercel handles static files itself
if (!isVercel) {
  const clientDist = path.join(__dirname, "..", "..", "client", "dist");
  const adminDist = path.join(__dirname, "..", "..", "admin", "dist");

  if (fs.existsSync(adminDist)) {
    app.use("/admin", express.static(adminDist));
    app.get("/admin/*splat", (_req, res) =>
      res.sendFile(path.join(adminDist, "index.html"))
    );
  }

  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get("/*splat", (_req, res) =>
      res.sendFile(path.join(clientDist, "index.html"))
    );
  } else {
    app.get("/", (_req, res) => res.json({ message: "Bloomsage API is running." }));
  }
}

app.use(notFoundHandler);
app.use(errorHandler);

// Ensure tables exist before accepting any requests
await runMigrations();

// Vercel picks this up as the serverless handler
export default app;

// Start a regular HTTP server when running locally
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Bloomsage API running at http://localhost:${PORT}`);
  });
}
