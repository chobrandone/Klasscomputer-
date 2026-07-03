# 🖥️ Klass Computer — Full-Stack E-Commerce Web App

A complete e-commerce platform for **Klass Computer**, a computer & electronics retail shop in Cameroon.
Neotek-inspired design · Klass Red brand (`#CC0000`) · pure white / near-black dark mode.

| Layer     | Tech                                                        |
|-----------|-------------------------------------------------------------|
| Backend   | NestJS 11 · TypeORM · PostgreSQL (SQLite fallback in dev)   |
| Frontend  | Next.js 15 (App Router, SSR/ISR) · Tailwind CSS · Zustand   |
| Auth      | JWT (15 min) + rotating refresh tokens (7 d, HttpOnly cookies) |
| Payments  | Stripe (card) + Mobile Money / Cash-on-Delivery stubs       |
| Email     | Nodemailer (HTML templates; console-logged when SMTP unset) |
| Admin     | Full dashboard: analytics (Recharts), products (Tiptap editor, variant builder, drag-drop uploads), orders, customers, categories, brands, banners, coupons, blog |

---

## 🚀 Run locally

> Dev ports: **API → 3002** (3001 is used by another local project), **frontend → 3000**.
> No PostgreSQL needed locally — with `DATABASE_URL` empty the API uses `backend/data/klass.sqlite`.

```bash
# 1. Backend
cd backend
npm install
npm run build
npm run seed        # demo data (safe to re-run; wipes & recreates)
npm run start:prod  # or: npm run start:dev

# 2. Frontend (new terminal)
cd frontend
npm install --legacy-peer-deps
npm run dev         # http://localhost:3000
```

**Demo accounts** (created by the seed):

| Role       | Email                    | Password      |
|------------|--------------------------|---------------|
| Superadmin | admin@klasscomputer.cm   | Admin123!     |
| Customer   | brandone@example.com     | Customer123!  |

Admin dashboard: `http://localhost:3000/admin`

---

## 📁 Structure

```
backend/            NestJS API
  src/auth          JWT login/register/refresh/reset (HttpOnly cookies)
  src/users         Profiles, roles, addresses, admin customer list
  src/products      CRUD, variants, filters/search/sort/pagination, bulk actions
  src/categories    Hierarchical tree with product counts
  src/brands        Brand management
  src/orders        Guest+user checkout, coupons, Stripe, status timeline, tracking
  src/cart          DB-backed cart (merged from guest cart at login)
  src/wishlist      Per-user wishlist toggle
  src/reviews       Ratings + star breakdown, auto product aggregates
  src/coupons       % / fixed codes with expiry & usage limits
  src/banners       Hero slider + promo banners
  src/blog          Posts with tags & publish toggle
  src/newsletter    Subscriptions + confirmation email
  src/upload        Image uploads (multer → /uploads)
  src/mail          Responsive branded HTML emails
  src/analytics     KPIs, sales chart (daily/monthly), top products, low stock
  src/seed          Demo data (28 products, categories, reviews, banners, blog)

frontend/           Next.js App Router
  src/app/(store)   Home, shop, category, product, cart, checkout, order
                    confirmation/tracking, wishlist, account, blog, about,
                    contact, FAQs, login/register/password reset
  src/app/(admin)   /admin — dashboard, products, orders, customers,
                    categories, brands, banners, coupons, blog
  src/components    Layout (header, cart drawer, footer), product cards,
                    shop filters, gallery, reviews, admin forms
  src/stores        Zustand: cart, wishlist, auth, UI
```

Key UX details: dismissible announcement bar, sticky header with categories
mega-dropdown & live search, autoplay hero slider (Swiper), quick-add product
cards with hover image swap, free-shipping progress bar in the cart drawer,
URL-driven shop filters (SSR), dark/light toggle persisted to localStorage,
skeleton loaders, branded 404/error pages, toast notifications everywhere.

---

## ▲ Vercel Deployment (frontend) + Railway/Render (API) + Neon (Postgres)

The Next.js frontend deploys perfectly to Vercel. The NestJS API needs a
persistent-process host (Railway, Render, or a VPS) — it is not serverless.
The database is already provisioned on **Neon**.

### 1. Push this repo to GitHub

```bash
git remote add origin https://github.com/<you>/klass-computer.git
git push -u origin main
```

### 2. Deploy the API (Railway — railway.app)

1. New Project → *Deploy from GitHub repo* → set **Root Directory = `backend`**.
2. Build command `npm run build`, start command `node dist/main.js`.
3. Environment variables:

```env
DATABASE_URL=postgresql://neondb_owner:***@ep-falling-lab-atde2u7r-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://<your-app>.vercel.app
JWT_SECRET=<long random string>
JWT_REFRESH_SECRET=<different long random string>
MAIL_FROM="Klass Computer <noreply@klasscomputer.cm>"
# SMTP_* and STRIPE_SECRET_KEY when ready
```

4. Note the public URL, e.g. `https://klass-api.up.railway.app`.
5. Seed once from your machine: point `backend/.env` `DATABASE_URL` at Neon and
   run `npm run seed` (already done for this database).

> Uploads note: Railway's filesystem resets on redeploy. Attach a Railway
> **Volume** mounted at the `UPLOAD_PATH`, or switch uploads to Cloudflare
> R2 / Vercel Blob for production image hosting.

### 3. Deploy the frontend (Vercel — vercel.com)

1. New Project → import the GitHub repo → set **Root Directory = `frontend`**
   (framework auto-detected: Next.js).
2. Environment variables:

```env
NEXT_PUBLIC_API_URL=/api
API_PROXY_URL=https://klass-api.up.railway.app
API_INTERNAL_URL=https://klass-api.up.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...   # when ready
```

3. Deploy. `next.config.mjs` rewrites `/api/*` to the Railway API, so the
   browser talks same-origin and the HttpOnly auth cookies work unchanged.
4. Go back to Railway and set `FRONTEND_URL` to the final Vercel URL.

That's it — storefront on Vercel's CDN, API on Railway, data on Neon.

---

## 🌍 Hostinger VPS Deployment (Ubuntu 22.04)

### 1. Server prerequisites

```bash
# Node 20 LTS via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 20

# PostgreSQL 15, Nginx, PM2, Certbot
sudo apt install postgresql-15 nginx
npm i -g pm2
sudo snap install certbot --classic

# Database
sudo -u postgres psql -c "CREATE USER klass WITH PASSWORD 'change-me';"
sudo -u postgres psql -c "CREATE DATABASE klass_db OWNER klass;"

# Uploads dir
sudo mkdir -p /var/www/klass/uploads && sudo chown $USER /var/www/klass/uploads
```

### 2. Environment

`backend/.env` on the server:

```env
DATABASE_URL=postgresql://klass:change-me@localhost:5432/klass_db
PORT=3001
FRONTEND_URL=https://klasscomputer.cm
JWT_SECRET=<long random string>
JWT_REFRESH_SECRET=<different long random string>
STRIPE_SECRET_KEY=sk_live_...
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@klasscomputer.cm
SMTP_PASS=...
MAIL_FROM="Klass Computer <noreply@klasscomputer.cm>"
UPLOAD_PATH=/var/www/klass/uploads
PUBLIC_URL=https://klasscomputer.cm/api
NODE_ENV=production
```

`frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://klasscomputer.cm/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

> Production note: the dev setup uses `synchronize: true` (auto schema). For a
> live store, switch to TypeORM migrations once the schema stabilises.

### 3. Build & run with PM2

```bash
cd backend  && npm ci && npm run build && npm run seed   # seed once
pm2 start dist/main.js --name klass-api

cd ../frontend && npm ci --legacy-peer-deps && npm run build
pm2 start npm --name klass-frontend -- start -- -p 3000

pm2 save && pm2 startup   # restart on reboot
```

### 4. Nginx reverse proxy

`/etc/nginx/sites-available/klasscomputer.cm`:

```nginx
server {
  server_name klasscomputer.cm www.klasscomputer.cm;

  client_max_body_size 10M;

  location /api/ {
    proxy_pass http://localhost:3001/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /uploads/ {
    alias /var/www/klass/uploads/;
    expires 30d;
  }

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/klasscomputer.cm /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d klasscomputer.cm -d www.klasscomputer.cm   # SSL
```

### 5. Updating

```bash
git pull
cd backend  && npm ci && npm run build && pm2 restart klass-api
cd ../frontend && npm ci --legacy-peer-deps && npm run build && pm2 restart klass-frontend
```

---

## 🔌 API quick reference

```
POST /auth/register|login|logout|refresh|forgot-password|reset-password · GET /auth/me
GET  /products?search=&category=&brand=&minPrice=&maxPrice=&rating=&sort=&page=&limit=&isSale=&isFeatured=&inStock=
GET  /products/:slug · /products/featured|new-arrivals|top-sellers|on-sale · /products/:slug/related
POST|PATCH|DELETE /products[/:id] (admin) · POST /products/bulk (admin)
GET  /categories (tree+counts) · /categories/:slug · admin CRUD
GET  /brands · admin CRUD
POST /orders (guest or user) · GET /orders/my · /orders/track?orderNumber=&email=
GET  /orders (admin, filters) · PATCH /orders/:id/status (admin, emails customer)
GET|POST|PATCH|DELETE /cart… (user) · POST /cart/merge
GET  /wishlist · POST /wishlist/toggle/:productId
GET  /reviews/product/:id (breakdown) · POST /reviews · DELETE /reviews/:id (admin)
POST /coupons/validate · admin CRUD
GET  /banners[?type=hero|promo][&all=true] · admin CRUD
GET  /blog · /blog/:slug · admin CRUD
POST /newsletter/subscribe · GET /newsletter (admin)
POST /upload/image|images (admin)
GET  /analytics/dashboard · /analytics/sales-chart?range=daily|monthly · /analytics/top-products (admin)
```
