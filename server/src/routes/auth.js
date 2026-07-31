import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db } from "../db/connection.js";
import { signToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { badRequest, conflict, unauthorized, notFound } from "../utils/apiError.js";
import { registerSchema, loginSchema, parseOrThrow } from "../utils/validators.js";
import { z } from "zod";

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters.").optional(),
});

// Strip sensitive fields before sending a user object to the client
function toPublicUser(row) {
  return { id: Number(row.id), name: row.name, email: row.email, role: row.role };
}

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const data = parseOrThrow(registerSchema, req.body, badRequest);

    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").get(data.email);
    if (existing) throw conflict("An account with that email already exists.");

    const passwordHash = bcrypt.hashSync(data.password, 10);
    const result = await db
      .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')")
      .run(data.name, data.email, passwordHash);

    const user = await db
      .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
      .get(Number(result.lastInsertRowid));

    res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const data = parseOrThrow(loginSchema, req.body, badRequest);
    const user = await db.prepare("SELECT * FROM users WHERE email = ?").get(data.email);

    if (!user || !bcrypt.compareSync(data.password, user.password_hash)) {
      throw unauthorized("Incorrect email or password.");
    }

    res.json({ token: signToken(user), user: toPublicUser(user) });
  } catch (err) { next(err); }
});

// GET /api/auth/me — returns the currently authenticated user
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await db
      .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
      .get(req.user.id);
    if (!user) throw notFound("Account not found.");
    res.json({ user: toPublicUser(user) });
  } catch (err) { next(err); }
});

// PATCH /api/auth/profile — update name and/or password
router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const data = parseOrThrow(updateProfileSchema, req.body, badRequest);
    const user = await db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!user) throw notFound("Account not found.");

    let newName = data.name ?? user.name;
    let newHash = user.password_hash;

    if (data.newPassword) {
      if (!data.currentPassword) throw badRequest("Current password is required to set a new one.");
      if (!bcrypt.compareSync(data.currentPassword, user.password_hash)) {
        throw badRequest("Current password is incorrect.");
      }
      newHash = bcrypt.hashSync(data.newPassword, 10);
    }

    await db
      .prepare("UPDATE users SET name = ?, password_hash = ? WHERE id = ?")
      .run(newName, newHash, user.id);

    const updated = await db
      .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
      .get(user.id);

    res.json({ user: toPublicUser(updated) });
  } catch (err) { next(err); }
});

// POST /api/auth/forgot-password
// Generates a reset token and returns it directly (no email service in this demo)
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw badRequest("Email is required.");

    const user = await db
      .prepare("SELECT id, email, name FROM users WHERE email = ?")
      .get(email.trim().toLowerCase());

    // Always return a success response — prevents email enumeration
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    // Clear any previous unused tokens for this account
    await db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(user.id);

    await db
      .prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)")
      .run(user.id, token, expiresAt);

    const origin = req.headers.origin || "https://bloomsage.vercel.app";
    const resetUrl = `${origin}/reset-password?token=${token}`;

    // In a real app this would be emailed — for the demo we return the URL directly
    res.json({
      message: "Reset link generated.",
      resetUrl,
      note: "In production this link would be sent by email.",
    });
  } catch (err) { next(err); }
});

// POST /api/auth/reset-password — consumes the token and sets a new password
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) throw badRequest("Reset token is required.");
    if (!newPassword || newPassword.length < 6) {
      throw badRequest("Password must be at least 6 characters.");
    }

    const record = await db
      .prepare("SELECT * FROM password_resets WHERE token = ? AND used = 0")
      .get(token);

    if (!record) throw badRequest("This reset link is invalid or has already been used.");

    if (new Date(record.expires_at) < new Date()) {
      throw badRequest("This reset link has expired — request a new one.");
    }

    await db
      .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
      .run(bcrypt.hashSync(newPassword, 10), record.user_id);

    // Mark used so it can't be replayed
    await db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(record.id);

    res.json({ message: "Password updated. You can now log in." });
  } catch (err) { next(err); }
});

export default router;
