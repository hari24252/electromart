# Free Deployment Guide — ElectroMart

Deploy **backend to Render** (free tier) and **frontend to Vercel** (free tier).
Both are zero-cost, no credit card needed, and work in under 30 minutes.

---

## Overview

```
Browser → Vercel (frontend, static) → calls → Render (backend API)
                                                     ↓
                                             MongoDB Atlas (free DB)
```

You need three free accounts:
1. **GitHub** — to push your code (both services deploy from GitHub)
2. **MongoDB Atlas** — free 512 MB database
3. **Render** — hosts the backend Node.js API
4. **Vercel** — hosts the frontend React app

---

## Step 1 — Push Your Code to GitHub

If you haven't already, create a GitHub repo and push the project.

```bash
cd /home/hariharan/Ecommerce

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/electromart.git
git branch -M main
git push -u origin main
```

> The repo should contain both the `backend/` and `frontend/` folders at the root.

---

## Step 2 — Set Up MongoDB Atlas (Free Database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up free
2. Click **Build a Database** → choose **M0 Free** (512 MB, free forever)
3. Pick any cloud region (closest to you)
4. Set a **username** and **password** (save these — you'll need them soon)
5. Under **Network Access** → click **Add IP Address** → choose **Allow Access from Anywhere** (`0.0.0.0/0`)
   - This is needed because Render uses dynamic IPs
6. Click **Connect** → **Connect your application** → copy the connection string

The connection string looks like:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Add your database name at the end:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/electromart?retryWrites=true&w=majority
```

Save this — you'll paste it into Render in the next step.

---

## Step 3 — Deploy the Backend to Render

1. Go to [https://render.com](https://render.com) and sign up free (use GitHub login)
2. Click **New +** → **Web Service**
3. Connect your GitHub account and select your `electromart` repository
4. Fill in the form:

| Field | Value |
|---|---|
| **Name** | `electromart-api` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

5. Click **Advanced** → **Add Environment Variables** — add all of these:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | *(paste your Atlas connection string from Step 2)* |
| `CLIENT_ORIGINS` | `https://YOUR-APP.vercel.app` *(fill in after Step 4 — come back and update)* |
| `USER_JWT_SECRET` | *(generate: run `openssl rand -hex 32` in your terminal)* |
| `ADMIN_JWT_SECRET` | *(generate another: run `openssl rand -hex 32` again)* |
| `USER_REFRESH_JWT_SECRET` | *(generate another: `openssl rand -hex 32`)* |
| `ADMIN_REFRESH_JWT_SECRET` | *(generate another: `openssl rand -hex 32`)* |
| `ACCESS_TOKEN_TTL` | `15m` |
| `REFRESH_TOKEN_TTL` | `30d` |
| `COOKIE_SECURE` | `true` |
| `INITIAL_ADMIN_NAME` | `Store Admin` *(or your real name)* |
| `INITIAL_ADMIN_EMAIL` | `your@realemail.com` *(not admin@example.com)* |
| `INITIAL_ADMIN_PASSWORD` | `YourStrongPassword123!` *(at least 10 chars, not ChangeMe123!)* |

> **Generate JWT secrets fast** — open your terminal and run this 4 times:
> ```bash
> openssl rand -hex 32
> ```
> Copy each result into a different JWT secret field. All 4 must be different.

6. Click **Create Web Service**

Render will build and deploy in ~3–5 minutes. Wait for the status to show **Live**.

7. Copy your Render URL — it looks like `https://electromart-api.onrender.com`

> **Free tier note:** Render free services spin down after 15 minutes of inactivity.
> The first request after idle takes ~30 seconds to cold-start. This is normal for the free tier.

---

## Step 4 — Deploy the Frontend to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign up free (use GitHub login)
2. Click **Add New Project** → select your `electromart` repository
3. Vercel will detect it's a Vite project. Configure:

| Field | Value |
|---|---|
| **Root Directory** | `frontend/project-bolt-sb1-sxjjgx29/project` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm ci` |

4. Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://electromart-api.onrender.com/api` *(your Render URL from Step 3)* |

5. Click **Deploy**

Vercel builds and deploys in ~2 minutes. You'll get a URL like:
`https://electromart.vercel.app`

---

## Step 5 — Update CORS on the Backend

Now that you have your Vercel URL, go back to Render and update the `CLIENT_ORIGINS` env variable:

1. In Render → your `electromart-api` service → **Environment**
2. Find `CLIENT_ORIGINS` and set it to your exact Vercel URL:
   ```
   https://electromart.vercel.app
   ```
   If you have a custom domain too, add it comma-separated:
   ```
   https://electromart.vercel.app,https://www.yourstore.com
   ```
3. Click **Save Changes** — Render will automatically redeploy

---

## Step 6 — Fix React Router on Vercel (Deep Links)

Vercel needs to know to send all routes to `index.html` (React Router handles routing client-side).

Create this file in the **frontend project root**:

```bash
# This file must be at:
# frontend/project-bolt-sb1-sxjjgx29/project/vercel.json
```
<br>

Create the file with this content:

**`frontend/project-bolt-sb1-sxjjgx29/project/vercel.json`**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Commit and push this file — Vercel will auto-redeploy:

```bash
cd /home/hariharan/Ecommerce
git add frontend/project-bolt-sb1-sxjjgx29/project/vercel.json
git commit -m "Add Vercel SPA rewrite rule"
git push
```

---

## Step 7 — Verify Everything Works

Open your Vercel URL and test:

```
✅ Landing page loads (hero, categories, feature strip)
✅ /catalog — products page loads
✅ /login and /signup work
✅ /admin/login → log in with your INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD
✅ Admin → Products → Create a product
✅ That product appears on the home page
```

To check your backend is live independently:
```
https://electromart-api.onrender.com/api/health
```
Should return: `{"success":true,"message":"OK",...}`

---

## Step 8 — Create Your First Admin & Add Products

1. Visit `https://your-app.vercel.app/admin/login`
2. Log in with the email/password you set in `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`
3. Go to **Admin → Categories** → create your categories (e.g. Smartphones, Laptops, Audio)
4. Go to **Admin → Products → New Product** → upload real product images, set price, mark featured if you want it on the homepage hero
5. Products with **status = Active** appear in the storefront immediately
6. Products with **isFeatured = true** appear in the "Featured Products" section on the home page
7. Products with a **Discount Price** lower than regular price appear in "Today's Deals"

---

## Updating After Code Changes

Every time you push to GitHub:
- **Vercel** auto-redeploys the frontend (takes ~2 min)
- **Render** auto-redeploys the backend (takes ~3–5 min)

No manual steps needed after the initial setup.

---

## Custom Domain (Optional)

**On Vercel:**
1. Go to your project → **Settings → Domains**
2. Add your domain (e.g. `www.yourstore.com`)
3. Follow the DNS instructions (add a CNAME record in your domain registrar)

**On Render:**
1. Go to your service → **Settings → Custom Domains**
2. Add your API domain (e.g. `api.yourstore.com`)
3. Update `VITE_API_URL` in Vercel env to `https://api.yourstore.com/api`
4. Update `CLIENT_ORIGINS` in Render env to include `https://www.yourstore.com`
5. Redeploy both

---

## Quick Reference

| What | URL |
|---|---|
| Your storefront | `https://YOUR-APP.vercel.app` |
| Admin panel | `https://YOUR-APP.vercel.app/admin` |
| Backend API | `https://electromart-api.onrender.com/api` |
| API health check | `https://electromart-api.onrender.com/api/health` |
| API docs (Swagger) | `https://electromart-api.onrender.com/api/docs` |
| MongoDB Atlas | `https://cloud.mongodb.com` |

---

## Troubleshooting

**"Products not showing on homepage"**
→ Make sure products have `status = active` in the admin panel.

**"Admin login doesn't work"**
→ Check that `INITIAL_ADMIN_EMAIL` in Render env is NOT `admin@example.com`. Must be a real email you set.

**"CORS error in browser console"**
→ Go to Render → Environment → update `CLIENT_ORIGINS` to your exact Vercel URL (no trailing slash). Save and wait for redeploy.

**"Page refreshes give 404 on Vercel"**
→ Make sure you created the `vercel.json` file from Step 6 and pushed it.

**"Backend takes 30 seconds to respond"**
→ Normal on Render free tier — the service cold-starts after 15 minutes idle. First request is slow, subsequent requests are fast.

**"Images not uploading"**
→ Set `CLOUDINARY_URL` in Render env. Get a free Cloudinary account at [cloudinary.com](https://cloudinary.com), go to Dashboard → copy the "API Environment variable" string. It looks like `cloudinary://key:secret@cloudname`.
