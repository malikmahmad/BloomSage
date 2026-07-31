// Seed Turso cloud database
import bcrypt from "bcryptjs";
import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://bloomsage-itzxahmiii11.aws-ap-south-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODQ4OTI4OTEsImlkIjoiMDE5ZjkzZTYtYmMwMS03MTQ3LTgzOGUtZDNmMzdjNjlkN2MyIiwia2lkIjoiR1NEd1BNNWJSNm1wU1JuQ0FFbmxoay04em1MM3h2cGJvTGZEbUhvdzMxQSIsInJpZCI6IjM0NzMwYWVmLTFjNTAtNDFjNi05M2UwLTk4ZTNkZWQ2MjQ0ZCJ9.nuYKG75KTB9roB59cZYo1eFGwvbw6SP--cySv7j1kgt_9DPEOl9Dr9_MlLH31NLnS_VkdFI3lEiSw9EVmgo0Bw",
});

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function run(sql, args = []) {
  return await client.execute({ sql, args });
}

console.log("Connecting to Turso...");

// Run schema
const schema = `
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')), created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, description TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', price REAL NOT NULL CHECK (price >= 0), compare_at_price REAL, category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, image_url TEXT NOT NULL DEFAULT '', stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0), sku TEXT UNIQUE, is_featured INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')), subtotal REAL NOT NULL, shipping_fee REAL NOT NULL DEFAULT 0, total_amount REAL NOT NULL, payment_method TEXT NOT NULL DEFAULT 'cod', shipping_name TEXT NOT NULL, shipping_phone TEXT NOT NULL, shipping_address TEXT NOT NULL, shipping_city TEXT NOT NULL, shipping_postal_code TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id INTEGER REFERENCES products(id) ON DELETE SET NULL, product_name TEXT NOT NULL, unit_price REAL NOT NULL, quantity INTEGER NOT NULL CHECK (quantity > 0));
CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), body TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE (product_id, user_id));
CREATE TABLE IF NOT EXISTS wishlists (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, created_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE (user_id, product_id));
CREATE TABLE IF NOT EXISTS contact_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT, message TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
`;

for (const stmt of schema.split(";").map(s => s.trim()).filter(Boolean)) {
  await client.execute(stmt);
}
console.log("Schema created.");

// Check if already seeded
const existing = await client.execute("SELECT COUNT(*) as count FROM products");
if (Number(existing.rows[0].count) > 0) {
  console.log("Already seeded:", existing.rows[0].count, "products found.");
  process.exit(0);
}

// Clear and reseed
await client.execute("DELETE FROM order_items");
await client.execute("DELETE FROM orders");
await client.execute("DELETE FROM wishlists");
await client.execute("DELETE FROM reviews");
await client.execute("DELETE FROM contact_messages");
await client.execute("DELETE FROM products");
await client.execute("DELETE FROM categories");
await client.execute("DELETE FROM users");

// Users
const adminHash = bcrypt.hashSync("Admin@123", 10);
const customerHash = bcrypt.hashSync("Customer@123", 10);
await run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", ["Bloomsage Admin", "admin@bloomsage.com", adminHash, "admin"]);
await run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", ["Demo Customer", "customer@bloomsage.com", customerHash, "customer"]);
console.log("Users seeded.");

// Categories
const cats = ["Cleansers", "Serums", "Moisturizers", "Masks", "Body Care", "Sun Care"];
const catIds = {};
for (const name of cats) {
  const r = await run("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)", [name, slugify(name), `${name} category.`]);
  catIds[name] = Number(r.lastInsertRowid);
}
console.log("Categories seeded.");

// Products
const products = [
  { name: "Oat Milk Cream Cleanser", cat: "Cleansers", price: 1450, cmp: null, stock: 42, sku: "BLM-CLN-001", feat: 1, img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80", desc: "A creamy low-foam cleanser with colloidal oat and squalane." },
  { name: "Green Tea Gel Cleanser", cat: "Cleansers", price: 1250, cmp: 1500, stock: 60, sku: "BLM-CLN-002", feat: 0, img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80", desc: "A gel-to-foam daily cleanser with green tea extract." },
  { name: "Niacinamide 10% Serum", cat: "Serums", price: 2100, cmp: null, stock: 35, sku: "BLM-SER-001", feat: 1, img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80", desc: "10% niacinamide with zinc PCA to visibly refine pores." },
  { name: "Vitamin C Brightening Serum", cat: "Serums", price: 2650, cmp: 2950, stock: 28, sku: "BLM-SER-002", feat: 1, img: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=800&q=80", desc: "15% stabilized vitamin C with ferulic acid and vitamin E." },
  { name: "Hyaluronic Acid Hydra Serum", cat: "Serums", price: 1950, cmp: null, stock: 50, sku: "BLM-SER-003", feat: 0, img: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&q=80", desc: "Multi-weight hyaluronic acid for deep hydration." },
  { name: "Ceramide Barrier Cream", cat: "Moisturizers", price: 2400, cmp: null, stock: 30, sku: "BLM-MOI-001", feat: 1, img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80", desc: "Rich barrier-repairing cream with ceramides." },
  { name: "Oil-Free Gel Moisturizer", cat: "Moisturizers", price: 1800, cmp: null, stock: 45, sku: "BLM-MOI-002", feat: 0, img: "https://images.unsplash.com/photo-1573461160327-f1c4e2d6fdc0?w=800&q=80", desc: "Weightless gel-cream for oily skin." },
  { name: "Overnight Repair Balm", cat: "Moisturizers", price: 2850, cmp: 3200, stock: 22, sku: "BLM-MOI-003", feat: 0, img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&q=80", desc: "Occlusive night balm with squalane and shea butter." },
  { name: "Pink Clay Detox Mask", cat: "Masks", price: 1650, cmp: null, stock: 38, sku: "BLM-MSK-001", feat: 0, img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80", desc: "French pink clay and kaolin for weekly detox." },
  { name: "Overnight Hydrogel Mask", cat: "Masks", price: 1900, cmp: null, stock: 40, sku: "BLM-MSK-002", feat: 0, img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80", desc: "Cooling hydrogel sheet mask for intensive hydration." },
  { name: "Whipped Shea Body Butter", cat: "Body Care", price: 1550, cmp: null, stock: 55, sku: "BLM-BOD-001", feat: 1, img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80", desc: "Light whipped body butter with shea and cocoa butter." },
  { name: "Coffee & Sugar Body Scrub", cat: "Body Care", price: 1350, cmp: 1550, stock: 48, sku: "BLM-BOD-002", feat: 0, img: "https://images.unsplash.com/photo-1611073615830-9b4ce5547bbe?w=800&q=80", desc: "Ground coffee and cane sugar in nourishing oil." },
  { name: "Dry Body Oil", cat: "Body Care", price: 1750, cmp: null, stock: 33, sku: "BLM-BOD-003", feat: 0, img: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80", desc: "Fast-absorbing blend of jojoba, grapeseed, and almond oil." },
  { name: "Mineral SPF 50 Fluid", cat: "Sun Care", price: 2200, cmp: null, stock: 40, sku: "BLM-SUN-001", feat: 1, img: "https://images.unsplash.com/photo-1526758097130-bab247274f58?w=800&q=80", desc: "Zinc-oxide mineral sunscreen, no white cast." },
  { name: "Tinted Mineral SPF 50", cat: "Sun Care", price: 2450, cmp: 2700, stock: 25, sku: "BLM-SUN-002", feat: 0, img: "https://images.unsplash.com/photo-1590156562745-5c2d6c65e078?w=800&q=80", desc: "Mineral SPF with a sheer universal tint." },
  { name: "SPF Setting Mist", cat: "Sun Care", price: 1900, cmp: null, stock: 30, sku: "BLM-SUN-003", feat: 0, img: "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=800&q=80", desc: "Fine SPF 30 mist for reapplication over makeup." },
];

for (const p of products) {
  await run(
    "INSERT INTO products (name, slug, description, price, compare_at_price, category_id, image_url, stock, sku, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [p.name, slugify(p.name), p.desc, p.price, p.cmp, catIds[p.cat], p.img, p.stock, p.sku, p.feat]
  );
}
console.log(`Seeded ${products.length} products.`);
console.log("Admin:    admin@bloomsage.com / Admin@123");
console.log("Customer: customer@bloomsage.com / Customer@123");
console.log("DONE!");
process.exit(0);
