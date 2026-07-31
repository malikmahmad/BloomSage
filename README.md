# 🌿 Bloomsage — Full-Stack E-Commerce Application

<div align="center">

**A premium, production-ready e-commerce platform for an original plant-based skincare brand**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-3a5641?style=for-the-badge)](https://bloomsage.vercel.app)
[![Admin Panel](https://img.shields.io/badge/Admin%20Panel-Open-1f2e23?style=for-the-badge)](https://bloomsage.vercel.app/admin)

| | |
|--|--|
| **Student** | Malik Muhammad Ahmad |
| **Project** | Bloomsage — Plant-Based Skincare |
| **Niche** | Cosmetics & Skincare (E-Commerce) |
| **Live URL** | https://bloomsage.vercel.app |
| **Admin URL** | https://bloomsage.vercel.app/admin |

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Requirements Checklist](#requirements-checklist)
- [Demo Credentials](#demo-credentials)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Security](#security)
- [Running Locally](#running-locally)
- [Deployment](#deployment)

---

## 🌿 Overview

Bloomsage is a **complete, original, full-stack e-commerce platform** built entirely from scratch. It is not a clone or recreation of any existing platform. Every aspect — branding, design, catalog, and feature-set — is 100% original.

The project covers the full scope of a real-world e-commerce business:
- A professional **customer-facing storefront** where users can browse, shop, review, and track orders
- A comprehensive **admin management panel** for full control over the store's data
- A **RESTful backend API** with authentication, authorization, and data validation
- A **cloud relational database** with proper schema design and constraints

---

## ✅ Requirements Checklist

| Requirement | Status | Detail |
|-------------|:------:|--------|
| Original E-Commerce project (not a clone) | ✅ | Bloomsage — original skincare brand, original design |
| Customer Website | ✅ | 13 pages, fully functional |
| Admin Panel (Mandatory) | ✅ | 8 management pages, separate app |
| Backend connected to Database | ✅ | Express.js REST API, 45+ endpoints |
| Relational Database | ✅ | Turso (libSQL/SQLite), 9 tables |
| Home Page | ✅ | Hero, trust badges, categories, featured products, testimonials, newsletter |
| Products Page | ✅ | Search, category filter, sort, pagination, skeleton loading |
| Product Details | ✅ | Images, description, reviews, ratings, wishlist, buy now |
| Cart Page | ✅ | Persistent cart, free shipping bar, quantity management |
| Checkout Page | ✅ | Shipping validation, COD + Card, real order placement |
| Login / Register | ✅ | JWT auth, password strength, forgot/reset password |
| About Page | ✅ | Team, values, stats, CTA |
| Contact Page | ✅ | Working form → saved to database |
| Order Management | ✅ | Place, track, cancel, view history |
| Admin: Product Management | ✅ | Full CRUD, image upload (Cloudinary), featured/active |
| Admin: Category Management | ✅ | Full CRUD |
| Admin: Inventory Management | ✅ | Stock overview, quick edit, low-stock alerts |
| Admin: Order Management | ✅ | Status filter, search, status updates |
| Admin: Customer Management | ✅ | Customer list, search, order stats |
| Admin: Dashboard & Analytics | ✅ | Revenue chart, top products, recent orders |
| Responsive Design | ✅ | Mobile, tablet, desktop |
| Input Validation | ✅ | Zod schemas, field-level error messages |
| Error Handling | ✅ | Consistent JSON errors, proper HTTP status codes |
| Clean Project Structure | ✅ | Organized monorepo |
| Live Deployment | ✅ | Vercel (free, no card required) |
| ZIP Submission | ✅ | Single ZIP — `Malik Muhammad Ahmad - Bloomsage.zip` |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@bloomsage.com` | `Admin@123` |
| **Customer** | `customer@bloomsage.com` | `Customer@123` |

> You can also register a new customer account directly from the website.

**Admin Panel Access:** After logging in as admin on the customer site, click the **"Admin Panel"** button that appears in the navbar.

---

## ✨ Features

### 🛍️ Customer Website — 13 Pages

| Page | URL | Key Features |
|------|-----|-------------|
| **Home** | `/` | Hero, trust badges, visual category grid, featured products, Why Bloomsage, customer testimonials, newsletter signup |
| **Shop** | `/shop` | Real-time search, category filters with counts, sort options, smart pagination, skeleton loading, product count |
| **Product Detail** | `/product/:slug` | Product images, description, SKU/stock info, interactive star reviews, wishlist toggle, quantity picker, buy now |
| **Cart** | `/cart` | Free shipping progress bar (free over Rs 3,000), quantity management, clear cart, guest checkout prompt |
| **Checkout** | `/checkout` | Shipping form with field-level validation, COD + Card demo payment, order summary with thumbnails |
| **Order Confirmation** | `/order-confirmation/:id` | Order progress stepper, items list, shipping details, payment info |
| **My Account** | `/account` | 3 tabs: Orders (with cancel), Wishlist (with add-to-cart), Profile (name + password change) |
| **Wishlist** | `/wishlist` | Saved products grid, quick add-to-cart, remove items |
| **Forgot Password** | `/forgot-password` | Email input → generates secure reset link |
| **Reset Password** | `/reset-password` | Token-based secure password reset |
| **Login** | `/login` | JWT authentication, forgot password link, home redirect |
| **Register** | `/register` | Password strength indicator, benefit highlights, home redirect |
| **About** | `/about` | Team profiles, company values with icons, stats (products, categories, etc.), CTA |
| **Contact** | `/contact` | Working form saved to DB, success state, contact info |

### 🔧 Admin Panel — 8 Management Pages

| Page | URL | Key Features |
|------|-----|-------------|
| **Dashboard** | `/admin` | Revenue/orders/products/customers KPIs, 14-day revenue area chart, top products bar chart, recent orders feed, low stock & unread messages alerts |
| **Products** | `/admin/products` | Full CRUD, Cloudinary image upload (or URL paste), preview thumbnail, search, category filter, featured/active toggles |
| **Categories** | `/admin/categories` | Full CRUD, product count per category, auto-slug generation |
| **Inventory** | `/admin/inventory` | Stock level table, color-coded alerts (critical/low/normal), low-stock filter, inline quick-edit, sort options |
| **Orders** | `/admin/orders` | Status filter tabs with counts, search by order #/customer/city, payment method column |
| **Order Detail** | `/admin/orders/:id` | Full order breakdown, status dropdown, shipping info, payment, notes |
| **Customers** | `/admin/customers` | Customer list, order count, lifetime spend, search by name/email |
| **Messages** | `/admin/messages` | Contact form inbox, read/unread status, message detail modal, reply via email, delete |

---

## 🛠️ Tech Stack

### Frontend (Customer & Admin)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.7 | UI framework |
| **Vite** | 8.1.1 | Build tool & dev server |
| **React Router** | 7.18.1 | Client-side routing |
| **Tailwind CSS** | 4.3.3 | Utility-first styling |
| **Lucide React** | 1.25.0 | Icon library |
| **Recharts** | 3.10.0 | Charts (admin dashboard) |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 22.5+ | Runtime |
| **Express** | 5.2.1 | Web framework |
| **@libsql/client** | Latest | Turso cloud database driver |
| **bcryptjs** | 3.0.3 | Password hashing |
| **jsonwebtoken** | 9.0.3 | JWT authentication |
| **Zod** | 4.4.3 | Schema validation |
| **multer** | 1.4.5 | File upload handling |
| **cloudinary** | Latest | Cloud image storage |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **Vercel** | Hosting (frontend static files + serverless API) |
| **Turso** | Cloud SQLite database (libSQL protocol) |
| **Cloudinary** | Product image uploads & storage |
| **GitHub** | Source control |

---

## 🗄️ Database Schema

**9 tables** with proper foreign keys, indexes, and constraints:

```sql
users               → Customer and admin accounts (role: customer|admin)
categories          → Product categories with slugs
products            → Full catalog (name, price, stock, SKU, images, featured)
orders              → Order headers (status, totals, shipping, payment)
order_items         → Order line items (product, quantity, unit price)
reviews             → Product star ratings (1–5) + comments
wishlists           → Saved products per user (unique per user+product)
contact_messages    → Contact form submissions (read/unread)
password_resets     → Secure password reset tokens (expires in 1h)
```

**Key design decisions:**
- Foreign key constraints for referential integrity
- Indexes on `orders.user_id`, `products.category_id`, `reviews.product_id`
- `CHECK` constraints on status enums, price ≥ 0, stock ≥ 0, rating 1–5
- Atomic order placement using Turso interactive transactions
- Soft delete via `is_active` flag on products

---

## 📡 API Endpoints

**45+ REST endpoints** organized into 9 route modules:

### Authentication — `/api/auth`
```
POST   /register         Create new customer account
POST   /login            Authenticate, returns JWT
GET    /me               Get current user (requires auth)
PATCH  /profile          Update name or change password
POST   /forgot-password  Request password reset token
POST   /reset-password   Set new password using token
```

### Products — `/api/products`
```
GET    /            List products (search, filter, sort, paginate)
GET    /:slug       Single product by URL slug
POST   /            Create product (admin)
PUT    /:id         Update product (admin)
DELETE /:id         Delete product (admin)
```

### Categories — `/api/categories`
```
GET    /     List all categories with product counts
GET    /:slug  Single category
POST   /     Create (admin)
PUT    /:id  Update (admin)
DELETE /:id  Delete (admin)
```

### Orders — `/api/orders`
```
POST   /           Place order — validates stock, atomic transaction
GET    /my         Customer's order history
GET    /           All orders — admin, filterable by status
GET    /:id        Single order with items
PATCH  /:id/status Update status (admin)
PATCH  /:id/cancel Cancel pending order, restores stock (customer)
```

### Reviews — `/api/reviews`
```
GET    /:productId  All reviews + average rating
POST   /:productId  Submit or update review (authenticated)
DELETE /:productId  Delete own review (authenticated)
```

### Wishlist — `/api/wishlist`
```
GET    /            Get user's wishlist
POST   /:productId  Add product to wishlist
DELETE /:productId  Remove from wishlist
```

### Contact — `/api/contact`
```
POST   /         Submit contact form (public)
GET    /         List all messages (admin)
PATCH  /:id/read Mark as read (admin)
DELETE /:id      Delete message (admin)
```

### Admin — `/api/admin`
```
GET    /stats          Dashboard KPIs + charts
GET    /customers      Customer list with order statistics
GET    /inventory      Product stock overview
PATCH  /inventory/:id  Quick stock update
```

### Upload — `/api/upload`
```
POST   /    Upload product image → Cloudinary (admin, max 5MB)
```

---

## 📁 Project Structure

```
bloomsage/                          ← Monorepo root
│
├── server/                         ← Express.js API
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql          ← 9-table database schema
│   │   │   ├── connection.js       ← Dual-mode DB (Turso/SQLite)
│   │   │   └── seed.js             ← Seed data (16 products, 2 users)
│   │   ├── routes/                 ← 9 route modules
│   │   │   ├── auth.js             ← Register, login, profile, reset
│   │   │   ├── products.js         ← Product CRUD
│   │   │   ├── categories.js       ← Category CRUD
│   │   │   ├── orders.js           ← Order placement & management
│   │   │   ├── reviews.js          ← Product reviews
│   │   │   ├── wishlist.js         ← Wishlist management
│   │   │   ├── contact.js          ← Contact form
│   │   │   ├── admin.js            ← Dashboard stats, inventory
│   │   │   └── upload.js           ← Cloudinary image upload
│   │   ├── middleware/
│   │   │   ├── auth.js             ← JWT verification + RBAC
│   │   │   └── errorHandler.js     ← Global error middleware
│   │   ├── utils/
│   │   │   ├── jwt.js              ← Token sign/verify
│   │   │   ├── validators.js       ← Zod schemas
│   │   │   └── apiError.js         ← HTTP error helpers
│   │   └── server.js               ← Express app entry point
│   └── package.json
│
├── client/                         ← Customer storefront (React)
│   └── src/
│       ├── pages/                  ← 13 page components
│       ├── components/
│       │   ├── layout/             ← Navbar, Footer
│       │   └── ui/                 ← ProductCard, ScrollToTop, etc.
│       ├── context/                ← AuthContext, CartContext
│       └── lib/                    ← api.js, format.js
│
├── admin/                          ← Admin panel (React, separate app)
│   └── src/
│       ├── pages/                  ← 8 management pages
│       ├── components/
│       │   ├── layout/             ← AdminLayout with sidebar
│       │   └── ui/                 ← Modal, RequireAdmin
│       └── lib/                    ← api.js, format.js
│
├── public/                         ← Built static files (Vercel)
│   ├── index.html                  ← Customer app entry
│   └── admin/                      ← Admin app entry
│
├── scripts/
│   └── copy-dist.js                ← Copies builds → public/ for Vercel
│
├── vercel.json                     ← Vercel routing configuration
├── package.json                    ← Root workspace scripts
└── README.md                       ← This file
```

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 10 salt rounds |
| Authentication | JWT tokens (7-day expiry) |
| Authorization | Role-based access control (customer/admin) enforced server-side |
| SQL injection | Parameterized queries throughout |
| Input validation | Zod schemas on every API endpoint |
| Password reset | Cryptographically secure tokens (1-hour expiry, single-use) |
| File upload | MIME type validation, 5MB size limit |
| Stock protection | Atomic database transactions prevent overselling |
| Token isolation | Admin and customer tokens use separate localStorage keys |

---

## 🚀 Running Locally

**Requirements:** Node.js 22.5+

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start the API server — http://localhost:4000
npm run dev:server

# 3. Start the customer website — http://localhost:5173
npm run dev:client

# 4. Start the admin panel — http://localhost:5174
npm run dev:admin
```

The local SQLite database is created and seeded automatically on first run.

### Reset local database
```bash
cd server
Remove-Item data/bloomsage.sqlite    # Windows
rm data/bloomsage.sqlite             # Mac/Linux
npm run seed
```

---

## ☁️ Deployment

**Stack:** Vercel (serverless) + Turso (cloud database) + Cloudinary (images)

### Architecture on Vercel
```
https://malik-muhammad-ahmad-bloomsage.vercel.app
│
├── /          → Customer website (React, static CDN)
├── /admin/*   → Admin panel (React, static CDN)
└── /api/*     → Express API (Node.js serverless function)
                     ↓
                 Turso Cloud Database
                 (libSQL, Mumbai region)
```

### Environment Variables (set in Vercel dashboard)

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | `libsql://bloomsage-itzxahmiii11.aws-ap-south-1.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso database auth token |
| `JWT_SECRET` | Secret key for signing JWTs |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Build & Deploy
```bash
# Build both React apps + copy to public/
npm run build

# Deploy — Vercel auto-deploys on every push to main
git push origin main
```

---

## 📦 Submission

| Item | Detail |
|------|--------|
| **Live URL** | https://bloomsage.vercel.app |
| **Admin URL** | https://bloomsage.vercel.app/admin |
| **ZIP File** | `Malik Muhammad Ahmad - Bloomsage.zip` |
| **Repository** | https://github.com/malikmahmad/malik-muhammad-ahmad-bloomsage |

---

## 👨‍💻 Developer

**Malik Muhammad Ahmad**

Full-Stack E-Commerce Application — Built for Advanced Task Evaluation

> *This project was built entirely from scratch, specifically for this evaluation task. All branding, design, code, and content is original. It is not a clone of any existing platform.*

---

<div align="center">

Made with 🌿 using React · Node.js · Express · Turso · Vercel

</div>
