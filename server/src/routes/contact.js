import { Router } from "express";
import { db } from "../db/connection.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { badRequest } from "../utils/apiError.js";
import { z } from "zod";
import { parseOrThrow } from "../utils/validators.js";

const router = Router();

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  subject: z.string().trim().optional().default(""),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
});

// POST /api/contact — public submission from the contact form
router.post("/", async (req, res, next) => {
  try {
    const data = parseOrThrow(contactSchema, req.body, badRequest);
    await db
      .prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)")
      .run(data.name, data.email, data.subject, data.message);
    res.status(201).json({ message: "Your message has been received. We'll get back to you soon." });
  } catch (err) { next(err); }
});

// GET /api/contact — admin inbox, newest first
router.get("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const messages = await db
      .prepare("SELECT * FROM contact_messages ORDER BY created_at DESC")
      .all();
    res.json({ messages });
  } catch (err) { next(err); }
});

// PATCH /api/contact/:id/read — mark a message as read
router.patch("/:id/read", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await db
      .prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?")
      .run(req.params.id);
    res.json({ message: "Marked as read." });
  } catch (err) { next(err); }
});

// DELETE /api/contact/:id — remove a message from the inbox
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await db.prepare("DELETE FROM contact_messages WHERE id = ?").run(req.params.id);
    res.json({ message: "Message deleted." });
  } catch (err) { next(err); }
});

export default router;
