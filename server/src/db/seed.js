import bcrypt from "bcryptjs";
import { db, runMigrations } from "./connection.js";

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function seed() {
  await runMigrations();

  // Skip seeding if products already exist — safe to run multiple times
  const existing = await db.prepare("SELECT COUNT(*) as count FROM products").get();
  if (Number(existing?.count) > 0) {
    console.log("Database already seeded — skipping.");
    return;
  }

  console.log("Seeding database…");

  const adminHash    = bcrypt.hashSync("Admin@123",    10);
  const customerHash = bcrypt.hashSync("Customer@123", 10);

  await db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .run("Bloomsage Admin", "admin@bloomsage.com", adminHash, "admin");
  await db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .run("Demo Customer", "customer@bloomsage.com", customerHash, "customer");

  const categories = [
    { name: "Cleansers",    description: "Gentle plant-based cleansers for every skin type." },
    { name: "Serums",       description: "Concentrated actives for targeted skin concerns." },
    { name: "Moisturizers", description: "Lightweight to rich hydration for day and night." },
    { name: "Masks",        description: "Weekly treatments for detox, glow, and repair." },
    { name: "Body Care",    description: "Nourishing balms, oils, and scrubs for the body." },
    { name: "Sun Care",     description: "Mineral SPF formulas that layer well under makeup." },
  ];

  const categoryIds = {};
  for (const cat of categories) {
    const result = await db
      .prepare("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)")
      .run(cat.name, slugify(cat.name), cat.description);
    categoryIds[cat.name] = Number(result.lastInsertRowid);
  }

  const products = [
    { name: "Oat Milk Cream Cleanser",       category: "Cleansers",    price: 1450, compareAt: null, stock: 42, sku: "BLM-CLN-001", featured: true,  image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80", description: "A creamy, low-foam cleanser with colloidal oat and squalane that lifts away makeup and SPF without stripping the skin barrier." },
    { name: "Green Tea Gel Cleanser",         category: "Cleansers",    price: 1250, compareAt: 1500, stock: 60, sku: "BLM-CLN-002", featured: false, image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80", description: "A gel-to-foam daily cleanser with green tea extract and mild surfactants derived from coconut." },
    { name: "Niacinamide 10% Serum",          category: "Serums",       price: 2100, compareAt: null, stock: 35, sku: "BLM-SER-001", featured: true,  image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80", description: "10% niacinamide with zinc PCA to visibly refine pores and even out tone." },
    { name: "Vitamin C Brightening Serum",    category: "Serums",       price: 2650, compareAt: 2950, stock: 28, sku: "BLM-SER-002", featured: true,  image: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=800&q=80", description: "15% stabilized vitamin C with ferulic acid and vitamin E." },
    { name: "Hyaluronic Acid Hydra Serum",    category: "Serums",       price: 1950, compareAt: null, stock: 50, sku: "BLM-SER-003", featured: false, image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&q=80", description: "Multi-weight hyaluronic acid that draws moisture into every layer of skin." },
    { name: "Ceramide Barrier Cream",         category: "Moisturizers", price: 2400, compareAt: null, stock: 30, sku: "BLM-MOI-001", featured: true,  image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80", description: "A rich, barrier-repairing cream with a 3:1:1 ceramide-cholesterol-fatty acid ratio." },
    { name: "Oil-Free Gel Moisturizer",       category: "Moisturizers", price: 1800, compareAt: null, stock: 45, sku: "BLM-MOI-002", featured: false, image: "https://images.unsplash.com/photo-1573461160327-f1c4e2d6fdc0?w=800&q=80", description: "A weightless gel-cream that hydrates without adding shine." },
    { name: "Overnight Repair Balm",          category: "Moisturizers", price: 2850, compareAt: 3200, stock: 22, sku: "BLM-MOI-003", featured: false, image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&q=80", description: "A thick, occlusive night balm with squalane and shea butter." },
    { name: "Pink Clay Detox Mask",           category: "Masks",        price: 1650, compareAt: null, stock: 38, sku: "BLM-MSK-001", featured: false, image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80", description: "French pink clay and kaolin draw out excess oil and impurities." },
    { name: "Overnight Hydrogel Mask",        category: "Masks",        price: 1900, compareAt: null, stock: 40, sku: "BLM-MSK-002", featured: false, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80", description: "A cooling hydrogel sheet mask left on overnight for an intensive hydration boost." },
    { name: "Whipped Shea Body Butter",       category: "Body Care",    price: 1550, compareAt: null, stock: 55, sku: "BLM-BOD-001", featured: true,  image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80", description: "A light, whipped body butter with shea and cocoa butter." },
    { name: "Coffee & Sugar Body Scrub",      category: "Body Care",    price: 1350, compareAt: 1550, stock: 48, sku: "BLM-BOD-002", featured: false, image: "https://images.unsplash.com/photo-1611073615830-9b4ce5547bbe?w=800&q=80", description: "Ground coffee and cane sugar in a nourishing oil base." },
    { name: "Dry Body Oil",                   category: "Body Care",    price: 1750, compareAt: null, stock: 33, sku: "BLM-BOD-003", featured: false, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80", description: "A fast-absorbing blend of jojoba, grapeseed, and sweet almond oil." },
    { name: "Mineral SPF 50 Fluid",           category: "Sun Care",     price: 2200, compareAt: null, stock: 40, sku: "BLM-SUN-001", featured: true,  image: "https://images.unsplash.com/photo-1526758097130-bab247274f58?w=800&q=80", description: "A zinc-oxide mineral sunscreen in a fluid, no-white-cast base." },
    { name: "Tinted Mineral SPF 50",          category: "Sun Care",     price: 2450, compareAt: 2700, stock: 25, sku: "BLM-SUN-002", featured: false, image: "https://images.unsplash.com/photo-1590156562745-5c2d6c65e078?w=800&q=80", description: "The same mineral base with a sheer universal tint." },
    { name: "SPF Setting Mist",               category: "Sun Care",     price: 1900, compareAt: null, stock: 30, sku: "BLM-SUN-003", featured: false, image: "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=800&q=80", description: "A fine SPF 30 mist for reapplication over makeup throughout the day." },
  ];

  for (const p of products) {
    await db
      .prepare(
        `INSERT INTO products
           (name, slug, description, price, compare_at_price, category_id,
            image_url, stock, sku, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        p.name, slugify(p.name), p.description, p.price, p.compareAt,
        categoryIds[p.category], p.image, p.stock, p.sku, p.featured ? 1 : 0
      );
  }

  console.log(`Seeded ${categories.length} categories, ${products.length} products, and 2 users.`);
  console.log("Admin    → admin@bloomsage.com    / Admin@123");
  console.log("Customer → customer@bloomsage.com / Customer@123");
}

seed().catch((err) => { console.error(err); process.exit(1); });
