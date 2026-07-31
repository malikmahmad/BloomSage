export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Convenience constructors so route handlers read naturally
export function notFound(message = "Resource not found") {
  return new ApiError(404, message);
}

export function badRequest(message = "Invalid request", details = null) {
  return new ApiError(400, message, details);
}

export function unauthorized(message = "Authentication required") {
  return new ApiError(401, message);
}

export function forbidden(message = "You don't have permission to do this") {
  return new ApiError(403, message);
}

export function conflict(message = "Resource already exists") {
  return new ApiError(409, message);
}
