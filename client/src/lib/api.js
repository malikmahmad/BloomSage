// In dev, Vite proxies /api to the backend (see vite.config.js).
// In production the Express server serves this app directly, so relative
// paths work in both environments — no need for a separate base URL.
const BASE = "/api";

function getToken() {
  return localStorage.getItem("bloomsage_token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me", { auth: true }),
  updateProfile: (payload) => request("/auth/profile", { method: "PATCH", body: payload, auth: true }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, newPassword) =>
    request("/auth/reset-password", { method: "POST", body: { token, newPassword } }),

  // Catalog
  getCategories: () => request("/categories"),
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (slug) => request(`/products/${slug}`),

  // Orders
  placeOrder: (payload) => request("/orders", { method: "POST", body: payload, auth: true }),
  getMyOrders: () => request("/orders/my", { auth: true }),
  getOrder: (id) => request(`/orders/${id}`, { auth: true }),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: "PATCH", auth: true }),

  // Reviews
  getReviews: (productId) => request(`/reviews/${productId}`),
  submitReview: (productId, payload) =>
    request(`/reviews/${productId}`, { method: "POST", body: payload, auth: true }),
  deleteReview: (productId) => request(`/reviews/${productId}`, { method: "DELETE", auth: true }),

  // Wishlist
  getWishlist: () => request("/wishlist", { auth: true }),
  addToWishlist: (productId) => request(`/wishlist/${productId}`, { method: "POST", auth: true }),
  removeFromWishlist: (productId) => request(`/wishlist/${productId}`, { method: "DELETE", auth: true }),

  // Contact
  sendContactMessage: (payload) => request("/contact", { method: "POST", body: payload }),
};

export function saveToken(token) {
  localStorage.setItem("bloomsage_token", token);
}

export function clearToken() {
  localStorage.removeItem("bloomsage_token");
}

export { getToken };
