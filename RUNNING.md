# How to Run the E-Commerce Application

Full-stack MERN app: **ElectroMart** — Express + TypeScript backend, React + Vite + TypeScript frontend.

---

## 1. Prerequisites

Make sure these are installed:

- **Node.js** >= 18
- **pnpm** (`npm install -g pnpm`)
- **MongoDB** (optional; if missing, the backend auto-starts an in-memory Mongo server for dev)

---

## 2. Quick Start (5 minutes)

Open **two terminals**.

### Terminal A — Backend (runs on http://localhost:5000)

```bash
cd backend
pnpm install          # first time only
pnpm dev
```

Wait until you see:
```
ElectroMart API listening  (port 5000)
Initial administrator created  (admin@example.com / ChangeMe123!)
```

Health check:
```bash
curl http://localhost:5000/api/health
```

### Terminal B — Frontend (runs on http://localhost:5173 or next free port)

```bash
cd frontend/project-bolt-sb1-sxjjgx29/project
pnpm install          # first time only
pnpm dev
```

Open the URL printed in the terminal (e.g. `http://localhost:5174`).

---

## 3. Access the App

| Area | URL | Credentials |
|------|-----|-------------|
| Storefront | http://localhost:5174 | Sign up as a new user |
| Admin Dashboard | http://localhost:5174/admin/login | `admin@example.com` / `ChangeMe123!` |
| API Documentation (Swagger) | http://localhost:5000/api/docs | - |
| API Health | http://localhost:5000/api/health | - |

---

## 4. All Scripts

### Backend (`cd backend`)

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start dev server with auto-reload (tsx watch) |
| `pnpm typecheck` | TypeScript type check (no emit) |
| `pnpm test` | Run Vitest test suite |
| `pnpm build` | Compile TS → `dist/` |
| `pnpm start` | Run production build (`dist/server.js`) |
| `pnpm seed:admin` | Seed default admin account |
| `pnpm seed:demo` | Seed demo categories + products |
| `pnpm db:indexes` | Sync MongoDB indexes |

### Frontend (`cd frontend/project-bolt-sb1-sxjjgx29/project`)

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm typecheck` | TypeScript type check |
| `pnpm build` | Production build → `dist/` |
| `pnpm preview` | Preview production build locally |

---

## 5. Environment Files

Already set up for local dev. Edit if needed:

- Backend config: [backend/.env](file:///home/hariharan/Ecommerce/backend/.env)
- Frontend config: [frontend/project-bolt-sb1-sxjjgx29/project/.env](file:///home/hariharan/Ecommerce/frontend/project-bolt-sb1-sxjjgx29/project/.env)

### Optional: Connect a real MongoDB

1. Install & start MongoDB locally (`sudo systemctl start mongod`) OR create a free cluster at https://cloud.mongodb.com
2. In `backend/.env` update:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/electronics-commerce
   ```
3. Restart backend (`pnpm dev`)

### Optional: Enable Cloudinary image CDN

1. Create free account at https://cloudinary.com
2. Copy the **API Environment variable** from your dashboard
3. In `backend/.env`:
   ```
   CLOUDINARY_URL=cloudinary://apiKey:apiSecret@cloudName
   ```
4. Restart backend — product images now auto-upload to Cloudinary

---

## 6. Product Image Upload Flow

1. Admin creates/edits a product in the dashboard UI
2. Frontend builds `FormData` + appends image files
3. Backend Multer middleware validates (JPEG/PNG/WebP/AVIF, max 5MB each, max 8 images)
4. If `CLOUDINARY_URL` set → uploads to Cloudinary, deletes local temp file
5. Otherwise → keeps file locally in `backend/public/uploads/products/`
6. Only the final URL (Cloudinary or local) is saved in MongoDB

---

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Port 5000 or 5173 in use | Kill the process on that port, or the next free port is used automatically |
| CORS errors | Check `CLIENT_ORIGINS` in `backend/.env` includes your frontend URL (port may be 5173/5174/etc.) |
| "MongoDB not reachable" | No problem — MongoMemoryServer starts automatically. Install MongoDB if you want persistent data. |
| Admin login fails | Run `cd backend && pnpm seed:admin` to recreate the admin account |
| Frontend shows no products | Run `cd backend && pnpm seed:demo` to seed sample data |
