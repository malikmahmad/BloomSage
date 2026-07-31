import { Router } from "express";
import { db } from "../db/connection.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { badRequest, notFound, conflict } from "../utils/apiError.js";
import { categorySchema, parseOrThrow } from "../utils/validators.js";

const router = Router();

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// GET /api/categories — includes product count for each category
router.get("/", async (req, res, next) => {
  try {
    const categories = await db
      .prepare(
        `SELECT c.*, COUNT(p.id) as product_count
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
         GROUP BY c.id ORDER BY c.name ASC`
      )
      .all();
    res.json({ categories });
  } catch (err) { next(err); }
});

// GET /api/categories/:slug
router.get("/:slug", async (req, res, next) => {
  try {
    const category = await db
      .prepare("SELECT * FROM categories WHERE slug = ?")
      .get(req.params.slug);
    if (!category) throw notFound("Category not found.");
    res.json({ category });
  } catch (err) { next(err); }
});

// POST /api/categories — admin only
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = parseOrThrow(categorySchema, req.body, badRequest);
    const slug = slugify(data.name);

    const existing = await db.prepare("SELECT id FROM categories WHERE slug = ?").get(slug);
    if (existing) throw conflict("A category with that name already exists.");

    const result = await db
      .prepare("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)")
      .run(data.name, slug, data.description);

    const category = await db
      .prepare("SELECT * FROM categories WHERE id = ?")
      .get(Number(result.lastInsertRowid));

    res.status(201).json({ category });
  } catch (err) { next(err); }
});

// PUT /api/categories/:id — admin only
router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = parseOrThrow(categorySchema, req.body, badRequest);
    const existing = await db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
    if (!existing) throw notFound("Category not found.");

    const slug = slugify(data.name);
    const clash = await db
      .prepare("SELECT id FROM categories WHERE slug = ? AND id != ?")
      .get(slug, req.params.id);
    if (clash) throw conflict("A category with that name already exists.");

    await db
      .prepare("UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?")
      .run(data.name, slug, data.description, req.params.id);

    const category = await db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
    res.json({ category });
  } catch (err) { next(err); }
});

// DELETE /api/categories/:id — admin only
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
    if (!existing) throw notFound("Category not found.");
    await db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ message: "Category deleted." });
  } catch (err) { next(err); }
});

export default router;
