import { Router } from "express";
import { db } from "../db/connection.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { badRequest, notFound, conflict } from "../utils/apiError.js";
import { productSchema, parseOrThrow } from "../utils/validators.js";

const router = Router();

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Map sort param names to SQL ORDER BY clauses
const SORT_MAP = {
  newest: "p.created_at DESC",
  "price-asc": "p.price ASC",
  "price-desc": "p.price DESC",
  name: "p.name ASC",
};

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const {
      category,
      search,
      sort = "newest",
      page = "1",
      pageSize = "12",
      featured,
      includeInactive,
    } = req.query;

    const conditions = [];
    const params = [];

    if (includeInactive !== "1") conditions.push("p.is_active = 1");
    if (category) {
      conditions.push("c.slug = ?");
      params.push(category);
    }
    if (search) {
      conditions.push("(p.name LIKE ? OR p.description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (featured === "1") conditions.push("p.is_featured = 1");

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderBy = SORT_MAP[sort] || SORT_MAP.newest;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(48, Math.max(1, parseInt(pageSize, 10) || 12));
    const offset = (pageNum - 1) * size;

    const countRow = await db
      .prepare(
        `SELECT COUNT(*) as count FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         ${whereClause}`
      )
      .get(...params);

    const products = await db
      .prepare(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p LEFT JOIN categories c ON c.id = p.category_id
         ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
      )
      .all(...params, size, offset);

    const total = Number(countRow?.count ?? 0);

    res.json({
      products,
      pagination: {
        page: pageNum,
        pageSize: size,
        total,
        totalPages: Math.max(1, Math.ceil(total / size)),
      },
    });
  } catch (err) { next(err); }
});

// GET /api/products/:slug
router.get("/:slug", async (req, res, next) => {
  try {
    const product = await db
      .prepare(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.slug = ?`
      )
      .get(req.params.slug);

    if (!product) throw notFound("Product not found.");
    res.json({ product });
  } catch (err) { next(err); }
});

// POST /api/products — admin only
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = parseOrThrow(productSchema, req.body, badRequest);
    let slug = slugify(data.name);

    // If the slug is taken, append a short timestamp suffix
    const existing = await db.prepare("SELECT id FROM products WHERE slug = ?").get(slug);
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const result = await db
      .prepare(
        `INSERT INTO products
           (name, slug, description, price, compare_at_price, category_id,
            image_url, stock, sku, is_featured, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.name, slug, data.description, data.price,
        data.compareAtPrice ?? null, data.categoryId ?? null,
        data.imageUrl, data.stock, data.sku || null,
        data.isFeatured ? 1 : 0, data.isActive ? 1 : 0
      );

    const product = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(Number(result.lastInsertRowid));

    res.status(201).json({ product });
  } catch (err) {
    if (err?.message?.includes("UNIQUE")) return next(conflict("A product with that SKU already exists."));
    next(err);
  }
});

// PUT /api/products/:id — admin only
router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const current = await db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!current) throw notFound("Product not found.");

    const data = parseOrThrow(productSchema, req.body, badRequest);

    // Only regenerate the slug if the name changed
    let slug = current.slug;
    if (data.name !== current.name) {
      slug = slugify(data.name);
      const clash = await db
        .prepare("SELECT id FROM products WHERE slug = ? AND id != ?")
        .get(slug, req.params.id);
      if (clash) slug = `${slug}-${Date.now().toString().slice(-5)}`;
    }

    await db
      .prepare(
        `UPDATE products SET
           name=?, slug=?, description=?, price=?, compare_at_price=?,
           category_id=?, image_url=?, stock=?, sku=?,
           is_featured=?, is_active=?, updated_at=datetime('now')
         WHERE id=?`
      )
      .run(
        data.name, slug, data.description, data.price,
        data.compareAtPrice ?? null, data.categoryId ?? null,
        data.imageUrl, data.stock, data.sku || null,
        data.isFeatured ? 1 : 0, data.isActive ? 1 : 0,
        req.params.id
      );

    const product = await db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    res.json({ product });
  } catch (err) {
    if (err?.message?.includes("UNIQUE")) return next(conflict("A product with that SKU already exists."));
    next(err);
  }
});

// DELETE /api/products/:id — admin only
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!existing) throw notFound("Product not found.");
    await db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ message: "Product deleted." });
  } catch (err) { next(err); }
});

export default router;
