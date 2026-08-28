# Electronics Commerce — Production Deployment Guide

## 1. Prerequisite Infrastructure

| Layer            | Minimum Version / Spec                                    |
|------------------|-----------------------------------------------------------|
| Node.js          | 20.x LTS (or 22.x LTS) — supports `fetch`, ESM `node:`    |
| Runtime          | pnpm 9+ (or npm 10+ / yarn 4+; pnpm recommended)         |
| Database         | MongoDB 6.0+ (Atlas M10 tier, or self-hosted replica set)|
| Reverse Proxy    | Nginx 1.25+ / Caddy 2 / Cloudflare (TLS termination)     |
| OS               | Ubuntu 22.04 LTS / Debian 12 / RHEL 9 (or container host)|
| Memory           | 2 GB RAM per service (4 GB+ on single-box deployments)   |
| Disk             | 10 GB SSD for build artifacts + uploads (Cloudinary offloads this) |
| TLS              | Valid HTTPS certificate — **COOKIE_SECURE=true in prod** |

Optional production integrations:
- **Cloudinary** — for product image CDN (set `CLOUDINARY_URL`; local `public/uploads/` fallback is built in)
- **Log aggregator** — Pino JSON logs ship natively to Datadog / Loki / ELK / Sumo
- **Uptime monitor** — hit `GET /api/health` and `GET /api/ready` (503 when DB disconnected)
- **WAF / CDN** — Cloudflare or AWS WAF in front adds DDoS + bot mitigation

---

## 2. Repository Layout

```
Ecommerce/
├── backend/                              Express 5 + TypeScript + Mongoose API
│   ├── src/
│   │   ├── config/          env.ts (zod validation), db.ts, logger.ts (Pino)
│   │   ├── middlewares/     auth, rate-limit, CORS, error handler
│   │   └── modules/         13 domain modules (auth, cart, order, product, …)
│   ├── dist/                compiled JS output after `npm run build`
│   ├── .env.example         backend env variable template
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/project-bolt-sb1-sxjjgx29/project/    React 18 + Vite + Tailwind + Zustand
│   ├── src/
│   ├── dist/                production bundle after `npm run build`
│   ├── .env.example         frontend env template (only VITE_API_URL)
│   ├── Dockerfile
│   └── nginx.conf           same-origin reverse proxy (proxies /api → backend)
└── DEPLOYMENT.md            (this file)
```

---

## 3. Production Environment Variables

### 3.1 Backend (`backend/.env`)

Copy the template and then **replace every secret with a real, long, random value**.

```bash
cp backend/.env.example backend/.env
```

| Variable                   | Required (prod) | Value Example / Notes                                                                 |
|----------------------------|-----------------|---------------------------------------------------------------------------------------|
| `NODE_ENV`                 | ✅ YES          | `production` — triggers zod production gate                                           |
| `PORT`                     | recommended     | `5000` (default) — internal API listen port                                           |
| `MONGODB_URI`              | ✅ YES          | `mongodb+srv://user:pw@atlas-cluster.mongodb.net/ecommerce?retryWrites=true&w=majority` |
| `CLIENT_ORIGINS`           | ✅ YES          | **Comma-separated** list of allowed browser origins. E.g. `https://shop.example.com,https://admin.example.com` |
| `USER_JWT_SECRET`          | ✅ YES          | ≥32 chars, random (generate: `openssl rand -hex 32`) — must NOT start with `development-` |
| `ADMIN_JWT_SECRET`         | ✅ YES          | ≥32 chars, **different** from USER secret                                             |
| `USER_REFRESH_JWT_SECRET`  | ✅ YES          | ≥32 chars, **different** from the access-token secret                                 |
| `ADMIN_REFRESH_JWT_SECRET` | ✅ YES          | ≥32 chars, **different** from USER_REFRESH                                            |
| `ACCESS_TOKEN_TTL`         | recommended     | `15m` (default)                                                                       |
| `REFRESH_TOKEN_TTL`        | recommended     | `30d` (default)                                                                       |
| `COOKIE_SECURE`            | ✅ YES          | `true` — zod refuses to boot prod without this. Sets Secure flag on refresh cookies.  |
| `CLOUDINARY_URL`           | optional        | `cloudinary://key:secret@cloud` — if empty, images fall back to `public/uploads/`     |
| `INITIAL_ADMIN_NAME`       | ✅ YES          | Real name, NOT `store administrator` (placeholder rejected by zod)                    |
| `INITIAL_ADMIN_EMAIL`      | ✅ YES          | Real email, NOT `admin@example.com` (placeholder rejected)                            |
| `INITIAL_ADMIN_PASSWORD`   | ✅ YES          | ≥10 chars, NOT `ChangeMe123!` (placeholder rejected) — creates the first admin on boot if missing |
| `SEED_DEMO_CATALOG`        | optional        | `false` (prod default); use `true` only for staging demo data                         |

**Security notes:**
- All 4 JWT secrets must be distinct. Never reuse `USER_*` ↔ `ADMIN_*` ↔ `*_REFRESH_*`.
- `CLIENT_ORIGINS` is whitelist-only. Any origin not in this list is rejected by the CORS callback.
- `MONGODB_URI` in production must **not** contain `localhost`; Atlas or a secured replica set is required.

### 3.2 Frontend (`frontend/project-bolt-sb1-sxjjgx29/project/.env`)

Frontend has exactly one runtime variable because the frontend is static:

```bash
cp frontend/project-bolt-sb1-sxjjgx29/project/.env.example frontend/project-bolt-sb1-sxjjgx29/project/.env
```

| Variable       | Required (prod) | Value Example / Notes                                                                 |
|----------------|-----------------|---------------------------------------------------------------------------------------|
| `VITE_API_URL` | ✅ YES          | **`/api`** for same-origin deployment (recommended — uses the Nginx proxy). If you deploy the backend to a different domain: `https://api.example.com/api` |

**Important:** `VITE_*` vars are baked into the HTML+JS at **build time**, not runtime. Rebuild the frontend if you change this value.

---

## 4. Build & Deployment Workflow

Follow these steps in order. Run them from the **repository root** (`/home/hariharan/Ecommerce`).

### 4.1 Install dependencies

```bash
# --- Backend ---
cd backend
pnpm install --prod=false     # install all deps (need devDeps for TypeScript build)
# or: npm ci

# --- Frontend ---
cd ../frontend/project-bolt-sb1-sxjjgx29/project
pnpm install --prod=false
# or: npm ci
```

### 4.2 Validate env (fail-fast sanity check)

The backend boots with zod validation — invalid env → immediate hard crash.

```bash
cd backend
node -e "import('./dist/server.js').catch(e=>{console.error(e.message);process.exit(1)})" \
  2>&1 || echo "Build not yet ready — will validate after build step"
```

(After step 4.3 this validation runs automatically on startup.)

### 4.3 Build both services

```bash
# Build backend (TypeScript → dist/)
cd backend
npm run typecheck      # optional but strongly recommended: strict tsc pass
npm run build

# Build frontend (tsc pass + Vite minified bundle → dist/)
cd ../frontend/project-bolt-sb1-sxjjgx29/project
npm run typecheck      # optional but strongly recommended
npm run build
```

**Expected build outputs:**
- Backend: `backend/dist/server.js` + `*.js` tree (112 TS files compiled)
- Frontend: `frontend/.../project/dist/assets/` with chunks:
  - `vendor-*.js` (~180 KB raw / ~59 KB gzip)
  - `ui-*.js` (~418 KB raw / ~113 KB gzip — includes Lucide icons)
  - `index-*.js`, `data-*.js`, `state-*.js`, plus per-page lazy chunks
  - Total first-load gzipped payload ~200 KB

### 4.4 Deploy Option A — Same-Origin via Nginx (Recommended)

This is the simplest and most secure topology: one public host serves both the frontend static bundle and proxies `/api/*` to the backend. The included `frontend/.../project/nginx.conf` and Dockerfiles implement this.

#### Frontend Nginx config keys (already in the file)
- `root  /usr/share/nginx/html;` — serves the `dist/` SPA bundle
- `try_files $uri /index.html;` — React Router deep links work
- `location /api/ { proxy_pass http://backend:5000/api/; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }`
- Sets `Cache-Control: immutable` for hashed chunk assets

#### Start the backend (systemd unit example)
```ini
# /etc/systemd/system/ecommerce-api.service
[Unit]
Description=Electronics Commerce API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/ecommerce/backend
EnvironmentFile=/opt/ecommerce/backend/.env
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=5
User=www-data
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ecommerce-api
sudo systemctl status ecommerce-api
```

#### Start the frontend (copy dist to Nginx)
```bash
FRONT_DIST=/home/hariharan/Ecommerce/frontend/project-bolt-sb1-sxjjgx29/project/dist
sudo rm -rf /usr/share/nginx/html/*
sudo cp -R "$FRONT_DIST"/* /usr/share/nginx/html/
sudo nginx -t && sudo systemctl reload nginx
```

### 4.5 Deploy Option B — Docker Compose

```bash
cd backend
# Edit docker-compose.yml to set:
#   - BACKEND_DOTENV_PATH (or inline env)
#   - MONGODB_URI pointing at a reachable MongoDB
docker compose up -d --build
```

Topology created by `docker-compose.yml`:
1. `backend` container → API on internal port
2. Optional `mongo` container (for staging only; **swap to Atlas URI for prod**)
3. `frontend` Nginx container → serves SPA + proxies `/api` to `backend`

### 4.6 Deploy Option C — PaaS (Render, Fly.io, Railway, Vercel)

| Service  | Platform suggestion           | Build Command                       | Start / Output                          |
|----------|-------------------------------|-------------------------------------|-----------------------------------------|
| Backend  | Render Web Service / Fly.io   | `cd backend && npm ci && npm run build` | `cd backend && npm start` (PORT env)  |
| Frontend | Vercel / Render Static Site   | `cd frontend/…/project && npm ci && npm run build` | Publish `frontend/…/project/dist` as static |

Cross-origin PaaS deployments: set `VITE_API_URL=https://api.example.com/api` and rebuild frontend, and include the frontend domain in backend `CLIENT_ORIGINS`.

---

## 5. Post-Deployment Verification Checks

Run these from any machine that can reach the deployed site.

### 5.1 Backend health endpoints

```bash
SITE=https://shop.example.com     # replace with your origin

# 1. Service health (should always return 200, even if DB flapped)
curl -sS "$SITE/api/health" | python3 -m json.tool
# expected: {"success":true,"message":"…","data":{"status":"healthy","timestamp":"…"}}

# 2. Readiness (200 = DB connected; 503 = DB down — load balancer should use this)
curl -sS -o /dev/null -w "%{http_code}" "$SITE/api/ready"
# expected: 200

# 3. Swagger / OpenAPI UI
xdg-open "$SITE/api/docs" 2>/dev/null || echo "Visit $SITE/api/docs"

# 4. CORS whitelist enforcement (expect error from a bad origin)
curl -sS -I -H "Origin: https://evil.example.com" "$SITE/api/health" | grep -i "access-control-allow-origin"
# expected: (empty — no header returned because origin is rejected)

# 5. CORS whitelist enforcement (expect OK for a good origin)
GOOD_ORIGIN=$(head -n1 <(echo "$SITE"))
curl -sS -I -H "Origin: $GOOD_ORIGIN" "$SITE/api/health" | grep -i "access-control-allow-origin"
# expected: access-control-allow-origin: $GOOD_ORIGIN
```

### 5.2 Admin bootstrap & auth

1. Visit `$SITE/admin/login`
2. Log in with the exact `INITIAL_ADMIN_EMAIL` + `INITIAL_ADMIN_PASSWORD` from `.env`
3. Expected behavior:
   - Successful login issues `admin_refresh_token` cookie (HttpOnly, Secure, SameSite=Lax)
   - Redirects to Admin Dashboard
   - Dashboard stats widget shows real numbers (not a spinner)

**If first-admin login fails:** check backend logs for `Initial administrator created` vs errors. Re-run `INITIAL_ADMIN_*` through the zod rules (no `admin@example.com`, no `ChangeMe123!`, ≥10-char password).

### 5.3 Storefront smoke test

1. Open `$SITE/` — landing page should render:
   - Hero carousel, FeatureStrip, quick category tiles (4 cols desktop / 2 cols mobile / 1 col small)
   - BrandStrip, Shop by Department, Today's Deals, Featured, Trending, New Arrivals
   - No array-commas visible (anywhere — comma issue resolved)
2. Click a product → Product Detail loads
3. Add to cart → CartDrawer slides in, line items correct (Qty / Price / Total)
4. Register a test customer account
5. Checkout flow → order creates → appears in Order History + Admin Orders grid
6. Leave a product review → appears after refresh
7. `/addresses` page CRUD, `/wishlist` persistence, `/coupons` redemption all functional

### 5.4 Responsive & performance checks

| Viewport        | Browser DevTools preset | Expectation |
|-----------------|-------------------------|-------------|
| 1920×1080       | Desktop                 | 4-column grids, max-width page wrapper |
| 768×1024        | iPad                    | 2/3-column grids, hamburger drawer nav |
| 390×844         | iPhone 12               | 1-column stacks, bottom sheet cart, tap targets ≥44px |

Performance: run Lighthouse in DevTools; production build should yield ≥90 Performance thanks to esbuild minification, manualChunks splitting, and lazy route/page loads.

### 5.5 Upload & file storage (conditional)

```bash
# If you set CLOUDINARY_URL — upload a product image via Admin → Product Create/Edit form.
# Verify image URL is served from res.cloudinary.com (not your origin).

# If CLOUDINARY_URL is empty (local fallback):
# - Verify `backend/public/uploads/` is writable by the node user
# - Verify `GET /uploads/<filename>` returns 200 + correct 30d immutable cache in prod
curl -sS -I "$SITE/uploads/sample.jpg" 2>&1 | grep -i cache-control
# expected: cache-control: public, max-age=2592000, immutable
```

### 5.6 Rate limiter & security headers

```bash
# Confirm Helmet headers present
curl -sS -I "$SITE/api/health" | grep -Ei "(strict-transport-security|x-frame-options|x-content-type-options|content-security-policy)"
# 4+ lines expected, each starting with the header name

# Rate limiter (express-rate-limit fires after repeated bursts — 429 Too Many Requests)
for i in $(seq 1 200); do curl -sS -o /dev/null -w "%{http_code}\n" "$SITE/api/health"; done | sort | uniq -c
# After ~100 rapid calls, expect some 429 counts to appear.
```

---

## 6. Troubleshooting Common Deployment Issues

### 6.1 Backend refuses to start — "Production requires explicit non-placeholder secrets…"

**Cause:** Zod production gate triggered. One of:
- A required env var is empty/missing (see list in `backend/src/config/env.ts:34-44`)
- A JWT secret still contains `development-` or `replace-with-`
- INITIAL_ADMIN_* is set to a placeholder value
- `COOKIE_SECURE` is not `true`

**Fix:**
```bash
cd backend
grep -E "^(USER|ADMIN).*SECRET|INITIAL_ADMIN|COOKIE_SECURE|MONGODB_URI|CLIENT_ORIGINS" .env
# Replace every flagged value. Generate JWT secrets with:
openssl rand -hex 32   # run 4 times for the 4 distinct JWT secrets
bcrypt is NOT needed for JWT secrets — 64 hex chars is ideal.
Restart the service after editing .env.
```

### 6.2 `GET /api/ready` returns 503

**Cause:** Backend process cannot reach MongoDB. 3 most common reasons:
1. MongoDB IP whitelist (Atlas Network Access) missing the deploy server's egress IP
2. VPC / security groups blocking 27017 outbound
3. MONGODB_URI contains `@localhost:` but no local `mongod` runs

**Fix:**
```bash
# From the backend server itself:
mongosh "$(grep MONGODB_URI backend/.env | cut -d= -f2-)" --eval "db.version()"
# If this fails, fix network / Atlas IP whitelist / replica set name first.
```

### 6.3 CORS errors in browser console ("Origin is not allowed by CORS")

**Cause:** The origin from which the frontend is served is missing from `CLIENT_ORIGINS`.

**Fix:**
```bash
# Edit backend/.env
CLIENT_ORIGINS=https://shop.example.com,https://www.shop.example.com,https://admin.shop.example.com
# Restart backend (systemctl restart ecommerce-api  or  docker compose up -d backend)
```

Note: `CLIENT_ORIGINS` is comma-separated. No trailing slashes. Include `https://` scheme and explicit ports if non-standard (`https://api.example.com:8443`).

### 6.4 Frontend deep links return 404 (`/products/some-product`)

**Cause:** Nginx (or equivalent) is not configured with `try_files $uri /index.html`. React Router uses client-side routing; all unknown paths must fall back to the SPA bootstrap.

**Fix:** Add this inside the frontend Nginx `server {}` block:
```nginx
location / {
  root   /usr/share/nginx/html;
  index  index.html index.htm;
  try_files $uri /index.html;
}
```

### 6.5 Admin or user can't log in — "Invalid credentials" / 401 loops

**Diagnose in order:**
1. Verify backend `.env` has `COOKIE_SECURE=true` AND the site is genuinely served over HTTPS (http:// with Secure cookies = cookies never sent → looks like invalid auth).
2. SameSite=Lax cookies require the frontend origin to be exactly in CLIENT_ORIGINS.
3. If you deploy backend on a separate API domain: set `VITE_API_URL` to that domain **before building the frontend**.
4. Clear existing stale cookies in browser devtools → Application → Storage → Clear site data → re-login.

### 6.6 Images broken after upload (local fallback, no Cloudinary)

**Cause 1:** `backend/public/uploads/` directory is not writable by the Node process user.
```bash
sudo mkdir -p /opt/ecommerce/backend/public/uploads
sudo chown -R www-data:www-data /opt/ecommerce/backend/public/uploads
sudo chmod -R u+rwX,g+rwX /opt/ecommerce/backend/public/uploads
```

**Cause 2:** Nginx is serving `/uploads/` from its own document root instead of proxying it to the backend. Ensure `/uploads/` is explicitly proxied OR the static root is the backend's public folder.

### 6.7 Build fails with TypeScript errors

**Cause:** Deploying after pulling a partial commit, or devDependencies missing.
```bash
# From repo root
git status
# Ensure clean HEAD, then
cd backend
rm -rf node_modules dist && npm ci && npm run build

cd ../frontend/project-bolt-sb1-sxjjgx29/project
rm -rf node_modules dist && npm ci && npm run build
```

### 6.8 413 "Request Entity Too Large" on product image uploads

**Cause:** Nginx `client_max_body_size` defaults too low (1 MB).

**Fix:** Raise in Nginx `server {}` or `http {}` block, AND keep aligned with Express:
```nginx
client_max_body_size 25M;
```
(Express is already configured with `express.json({ limit: '1mb' })` and Multer handles multipart separately — Nginx is the usual culprit.)

---

## 7. Maintenance & Operations Checklist

| Frequency | Action                                                                                                                               |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------|
| Weekly    | Rotate INITIAL_ADMIN_PASSWORD → set new via Admin → Users → Reset; remove `INITIAL_ADMIN_*` from `.env` after first admin is seeded (optional hardening) |
| Monthly   | Run `cd backend && npm run db:indexes` — ensures Mongoose indexes exist on collections                                              |
| Monthly   | Rotate JWT refresh secrets one pair at a time (USER first, then ADMIN a day later) — forces re-login without simultaneous downtime  |
| On deploy | Run `cd backend && npm test` (9 tests, health + boundaries + tokens) to catch any regressions before traffic                          |
| On deploy | Lighthouse audit on `/`, `/products/featured-product-slug`, `/cart`, `/admin/login` — confirm Performance ≥90 and A11y ≥90           |

---

## 8. Quick Deploy Cheat Sheet (copy-paste)

```bash
# === 1. Prep env ===
cd /home/hariharan/Ecommerce
cp backend/.env.example backend/.env
cp frontend/project-bolt-sb1-sxjjgx29/project/.env.example frontend/project-bolt-sb1-sxjjgx29/project/.env
#   >> edit backend/.env — set NODE_ENV=production, COOKIE_SECURE=true, real secrets <<
#   >> edit frontend/…/project/.env — ensure VITE_API_URL=/api <<

# === 2. Install & build ===
(cd backend && npm ci && npm run typecheck && npm run build)
(cd frontend/project-bolt-sb1-sxjjgx29/project && npm ci && npm run typecheck && npm run build)

# === 3. Validate tests (on build machine) ===
(cd backend && npm test)

# === 4. Deploy backend (systemd) ===
sudo rsync -av backend/dist backend/package.json backend/node_modules user@host:/opt/ecommerce/backend/
sudo scp backend/.env user@host:/opt/ecommerce/backend/.env
ssh user@host "sudo systemctl restart ecommerce-api && sudo systemctl status ecommerce-api --no-pager"

# === 5. Deploy frontend (same-origin Nginx) ===
sudo rsync -av frontend/project-bolt-sb1-sxjjgx29/project/dist/ user@host:/usr/share/nginx/html/
ssh user@host "sudo nginx -t && sudo systemctl reload nginx"

# === 6. Smoke ===
SITE=https://shop.example.com
curl -sS "$SITE/api/health" && echo ""
curl -sS -o /dev/null -w "ready=%{http_code}\n" "$SITE/api/ready"
```
