import { Router } from "express";
import { db } from "../db/connection.js";
import { requireAuth } from "../middleware/auth.js";
import { notFound } from "../utils/apiError.js";

const router = Router();

// GET /api/wishlist — user's saved products with full product details
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const items = await db
      .prepare(
        `SELECT w.id as wishlist_id, w.created_at as added_at,
                p.*, c.name as category_name, c.slug as category_slug
         FROM wishlists w
         JOIN products p ON p.id = w.product_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE w.user_id = ?
         ORDER BY w.created_at DESC`
      )
      .all(req.user.id);
    res.json({ items });
  } catch (err) { next(err); }
});

// POST /api/wishlist/:productId — add to wishlist (silently ignores duplicates)
router.post("/:productId", requireAuth, async (req, res, next) => {
  try {
    const product = await db
      .prepare("SELECT id FROM products WHERE id = ?")
      .get(req.params.productId);
    if (!product) throw notFound("Product not found.");

    const already = await db
      .prepare("SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?")
      .get(req.user.id, req.params.productId);

    if (!already) {
      await db
        .prepare("INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)")
        .run(req.user.id, req.params.productId);
    }

    res.json({ message: "Added to wishlist." });
  } catch (err) { next(err); }
});

// DELETE /api/wishlist/:productId — remove from wishlist
router.delete("/:productId", requireAuth, async (req, res, next) => {
  try {
    await db
      .prepare("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?")
      .run(req.user.id, req.params.productId);
    res.json({ message: "Removed from wishlist." });
  } catch (err) { next(err); }
});

export default router;
