// Admin panel uses a separate localStorage key from the customer site
// so sessions don't interfere with each other
const BASE = "/api";

function getToken() {
  return localStorage.getItem("bloomsage_admin_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
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
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  // Dashboard
  getStats: () => request("/admin/stats"),

  // Customers
  getCustomers: () => request("/admin/customers"),

  // Inventory
  getInventory: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return request(`/admin/inventory${qs ? `?${qs}` : ""}`);
  },
  updateStock: (id, stock) =>
    request(`/admin/inventory/${id}`, { method: "PATCH", body: { stock } }),

  // Categories
  getCategories: () => request("/categories", { auth: false }),
  createCategory: (payload) => request("/categories", { method: "POST", body: payload }),
  updateCategory: (id, payload) => request(`/categories/${id}`, { method: "PUT", body: payload }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return request(`/products${qs ? `?${qs}` : ""}`, { auth: false });
  },
  createProduct: (payload) => request("/products", { method: "POST", body: payload }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: "PUT", body: payload }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  // Orders
  getOrders: (status) => request(`/orders${status ? `?status=${status}` : ""}`),
  getOrder: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: "PATCH", body: { status } }),

  // Contact messages
  getMessages: () => request("/contact"),
  markMessageRead: (id) => request(`/contact/${id}/read`, { method: "PATCH" }),
  deleteMessage: (id) => request(`/contact/${id}`, { method: "DELETE" }),

  // Image upload — uses FormData so Content-Type must not be set manually
  uploadImage: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${BASE}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    return data; // { url }
  },
};

export function saveToken(token) {
  localStorage.setItem("bloomsage_admin_token", token);
}

export function clearToken() {
  localStorage.removeItem("bloomsage_admin_token");
}

export { getToken };
