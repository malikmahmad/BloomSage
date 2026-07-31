import { verifyToken } from "../utils/jwt.js";
import { unauthorized, forbidden } from "../utils/apiError.js";

// Require a valid JWT — blocks the request if missing or expired
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(unauthorized("Please log in to continue."));
  }

  try {
    req.user = verifyToken(token); // { id, role }
    next();
  } catch {
    next(unauthorized("Your session has expired. Please log in again."));
  }
}

// Must come after requireAuth — checks that the authenticated user is an admin
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(unauthorized("Please log in to continue."));
  }
  if (req.user.role !== "admin") {
    return next(forbidden("You need admin access to do that."));
  }
  next();
}

// Soft auth — attaches req.user when a valid token is present but never
// blocks the request. Used for routes that behave differently for guests
// vs. authenticated users (e.g. showing a user's own review first).
export function attachUserIfPresent(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Invalid token — just skip it, don't block the request
    }
  }
  next();
}
