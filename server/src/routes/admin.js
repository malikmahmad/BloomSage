import { Router } from "express";
import { db } from "../db/connection.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(requireAuth, requireAdmin);

// GET /api/admin/stats — dashboard KPIs, charts, and alerts
router.get("/stats", async (req, res, next) => {
  try {
    const revenueRow = await db
      .prepare("SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status != 'cancelled'")
      .get();

    const orderCount = (await db.prepare("SELECT COUNT(*) as count FROM orders").get())?.count ?? 0;
    const productCount = (await db.prepare("SELECT COUNT(*) as count FROM products").get())?.count ?? 0;
    const customerCount = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get())?.count ?? 0;
    const pendingCount = (await db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get())?.count ?? 0;
    const lowStockCount = (await db.prepare("SELECT COUNT(*) as count FROM products WHERE stock <= 5 AND is_active = 1").get())?.count ?? 0;
    const unreadMessages = (await db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0").get())?.count ?? 0;

    const recentOrders = await db
      .prepare(
        `SELECT o.*, u.name as customer_name
         FROM orders o JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC LIMIT 5`
      )
      .all();

    const topProducts = await db
      .prepare(
        `SELECT p.name, p.image_url, SUM(oi.quantity) as units_sold
         FROM order_items oi JOIN products p ON p.id = oi.product_id
         GROUP BY oi.product_id ORDER BY units_sold DESC LIMIT 5`
      )
      .all();

    // Revenue trend for the area chart — last 14 days
    const revenueTrend = await db
      .prepare(
        `SELECT
           date(created_at) as day,
           COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as revenue,
           COUNT(*) as orders
         FROM orders
         WHERE created_at >= datetime('now', '-14 days')
         GROUP BY date(created_at)
         ORDER BY day ASC`
      )
      .all();

    res.json({
      revenue: revenueRow?.revenue ?? 0,
      orderCount: Number(orderCount),
      productCount: Number(productCount),
      customerCount: Number(customerCount),
      pendingCount: Number(pendingCount),
      lowStockCount: Number(lowStockCount),
      unreadMessages: Number(unreadMessages),
      recentOrders,
      topProducts,
      revenueTrend,
    });
  } catch (err) { next(err); }
});

// GET /api/admin/customers — customer list with order stats
router.get("/customers", async (req, res, next) => {
  try {
    const customers = await db
      .prepare(
        `SELECT
           u.id, u.name, u.email, u.created_at,
           COUNT(o.id) as order_count,
           COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id
         WHERE u.role = 'customer'
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      )
      .all();
    res.json({ customers });
  } catch (err) { next(err); }
});

// GET /api/admin/inventory — stock overview with optional low-stock filter
router.get("/inventory", async (req, res, next) => {
  try {
    const { sort = "stock-asc", lowStock } = req.query;
    const SORT_MAP = {
      "stock-asc": "p.stock ASC",
      "stock-desc": "p.stock DESC",
      name: "p.name ASC",
    };
    const where = lowStock === "1" ? "WHERE p.stock <= 10" : "";
    const orderBy = SORT_MAP[sort] || SORT_MAP["stock-asc"];

    const products = await db
      .prepare(
        `SELECT p.id, p.name, p.sku, p.stock, p.is_active, p.image_url, c.name as category_name
         FROM products p LEFT JOIN categories c ON c.id = p.category_id
         ${where} ORDER BY ${orderBy}`
      )
      .all();

    res.json({ products });
  } catch (err) { next(err); }
});

// PATCH /api/admin/inventory/:id — quick inline stock update
router.patch("/inventory/:id", async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ error: "Stock must be a non-negative number." });
    }

    const existing = await db.prepare("SELECT id FROM products WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Product not found." });

    await db
      .prepare("UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?")
      .run(Math.floor(Number(stock)), req.params.id);

    const product = await db
      .prepare("SELECT id, name, sku, stock, image_url FROM products WHERE id = ?")
      .get(req.params.id);

    res.json({ product });
  } catch (err) { next(err); }
});

export default router;
