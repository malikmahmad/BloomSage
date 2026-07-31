import { ApiError } from "../utils/apiError.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "That route doesn't exist." });
}

// Global error handler — must have 4 params for Express to treat it as one
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Known application errors — send back the structured message
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Unexpected errors — log them server-side and return a generic message
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on our end. Please try again." });
}
