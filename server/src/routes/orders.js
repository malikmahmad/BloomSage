import { Router } from "express";
import { db } from "../db/connection.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { badRequest, notFound, forbidden } from "../utils/apiError.js";
import { orderSchema, orderStatusSchema, parseOrThrow } from "../utils/validators.js";

const router = Router();
const SHIPPING_FEE = 200;

// Fetch a single order with its line items
async function getOrderWithItems(orderId) {
  const order = await db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return null;
  const items = await db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
  return { ...order, items };
}

// POST /api/orders — place a new order (authenticated customers)
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = parseOrThrow(orderSchema, req.body, badRequest);

    // Wrap everything in a transaction — stock is decremented atomically
    // so two concurrent requests can't both oversell the same product
    const orderId = await db.transaction(async (txDb) => {
      let subtotal = 0;
      const lineItems = [];

      for (const item of data.items) {
        const product = await txDb
          .prepare("SELECT * FROM products WHERE id = ?")
          .get(item.productId);

        if (!product || !product.is_active) {
          throw badRequest("One of the items in your cart is no longer available.");
        }
        if (Number(product.stock) < item.quantity) {
          throw badRequest(
            `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} of "${product.name}" left — adjust the quantity and try again.`
          );
        }

        subtotal += Number(product.price) * item.quantity;
        lineItems.push({ product, quantity: item.quantity });
      }

      const total = subtotal + SHIPPING_FEE;

      const orderResult = await txDb
        .prepare(
          `INSERT INTO orders
             (user_id, status, subtotal, shipping_fee, total_amount, payment_method,
              shipping_name, shipping_phone, shipping_address, shipping_city,
              shipping_postal_code, notes)
           VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          req.user.id, subtotal, SHIPPING_FEE, total,
          data.paymentMethod, data.shipping.fullName, data.shipping.phone,
          data.shipping.address, data.shipping.city,
          data.shipping.postalCode, data.notes
        );

      const newOrderId = Number(orderResult.lastInsertRowid);

      for (const { product, quantity } of lineItems) {
        await txDb
          .prepare(
            "INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)"
          )
          .run(newOrderId, product.id, product.name, product.price, quantity);

        await txDb
          .prepare("UPDATE products SET stock = stock - ? WHERE id = ?")
          .run(quantity, product.id);
      }

      return newOrderId;
    });

    res.status(201).json({ order: await getOrderWithItems(orderId) });
  } catch (err) { next(err); }
});

// GET /api/orders/my — authenticated user's own orders
router.get("/my", requireAuth, async (req, res, next) => {
  try {
    const orders = await db
      .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
      .all(req.user.id);
    res.json({ orders });
  } catch (err) { next(err); }
});

// GET /api/orders — all orders, admin only (optional status filter)
router.get("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.query;
    const sql = `SELECT o.*, u.name as customer_name, u.email as customer_email
                 FROM orders o JOIN users u ON u.id = o.user_id
                 ${status ? "WHERE o.status = ?" : ""}
                 ORDER BY o.created_at DESC`;
    const orders = status
      ? await db.prepare(sql).all(status)
      : await db.prepare(sql).all();
    res.json({ orders });
  } catch (err) { next(err); }
});

// GET /api/orders/:id — accessible to the owning customer or any admin
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const order = await getOrderWithItems(req.params.id);
    if (!order) throw notFound("Order not found.");
    if (Number(order.user_id) !== req.user.id && req.user.role !== "admin") {
      throw forbidden("You don't have access to that order.");
    }
    res.json({ order });
  } catch (err) { next(err); }
});

// PATCH /api/orders/:id/status — admin only
router.patch("/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = parseOrThrow(orderStatusSchema, req.body, badRequest);
    const existing = await db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    if (!existing) throw notFound("Order not found.");
    await db
      .prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .run(data.status, req.params.id);
    res.json({ order: await getOrderWithItems(req.params.id) });
  } catch (err) { next(err); }
});

// PATCH /api/orders/:id/cancel — customer cancels their own pending order
// Stock is restored inside a transaction so it's always consistent
router.patch("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const order = await db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    if (!order) throw notFound("Order not found.");
    if (Number(order.user_id) !== req.user.id) throw forbidden("That's not your order.");
    if (order.status !== "pending") throw badRequest("Only pending orders can be cancelled.");

    await db.transaction(async (txDb) => {
      const items = await txDb
        .prepare("SELECT * FROM order_items WHERE order_id = ?")
        .all(order.id);

      for (const item of items) {
        if (item.product_id) {
          await txDb
            .prepare("UPDATE products SET stock = stock + ? WHERE id = ?")
            .run(item.quantity, item.product_id);
        }
      }

      await txDb
        .prepare("UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?")
        .run(order.id);
    });

    res.json({ order: await getOrderWithItems(req.params.id) });
  } catch (err) { next(err); }
});

export default router;
