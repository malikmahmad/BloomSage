import { Router } from "express";
import { db } from "../db/connection.js";
import { requireAuth } from "../middleware/auth.js";
import { badRequest, notFound } from "../utils/apiError.js";
import { z } from "zod";
import { parseOrThrow } from "../utils/validators.js";

const router = Router();

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().max(1000).optional().default(""),
});

// GET /api/reviews/:productId — public
router.get("/:productId", async (req, res, next) => {
  try {
    const reviews = await db
      .prepare(
        `SELECT r.*, u.name as reviewer_name
         FROM reviews r JOIN users u ON u.id = r.user_id
         WHERE r.product_id = ?
         ORDER BY r.created_at DESC`
      )
      .all(req.params.productId);

    const average = reviews.length
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : null;

    res.json({ reviews, average, count: reviews.length });
  } catch (err) { next(err); }
});

// POST /api/reviews/:productId — upsert: create or update the user's review
router.post("/:productId", requireAuth, async (req, res, next) => {
  try {
    const product = await db
      .prepare("SELECT id FROM products WHERE id = ?")
      .get(req.params.productId);
    if (!product) throw notFound("Product not found.");

    const data = parseOrThrow(reviewSchema, req.body, badRequest);

    const existing = await db
      .prepare("SELECT id FROM reviews WHERE product_id = ? AND user_id = ?")
      .get(req.params.productId, req.user.id);

    if (existing) {
      await db
        .prepare("UPDATE reviews SET rating = ?, body = ? WHERE id = ?")
        .run(data.rating, data.body, existing.id);
    } else {
      await db
        .prepare("INSERT INTO reviews (product_id, user_id, rating, body) VALUES (?, ?, ?, ?)")
        .run(req.params.productId, req.user.id, data.rating, data.body);
    }

    // Return updated review list so the UI can refresh in one round trip
    const reviews = await db
      .prepare(
        `SELECT r.*, u.name as reviewer_name
         FROM reviews r JOIN users u ON u.id = r.user_id
         WHERE r.product_id = ?
         ORDER BY r.created_at DESC`
      )
      .all(req.params.productId);

    const average = reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length;
    res.json({ reviews, average, count: reviews.length });
  } catch (err) { next(err); }
});

// DELETE /api/reviews/:productId — remove the authenticated user's review
router.delete("/:productId", requireAuth, async (req, res, next) => {
  try {
    const existing = await db
      .prepare("SELECT id FROM reviews WHERE product_id = ? AND user_id = ?")
      .get(req.params.productId, req.user.id);
    if (!existing) throw notFound("Review not found.");
    await db.prepare("DELETE FROM reviews WHERE id = ?").run(existing.id);
    res.json({ message: "Review deleted." });
  } catch (err) { next(err); }
});

export default router;
