# Electromart Storefront (Frontend)

This frontend is a Vite + React + TypeScript single-page application styled with Tailwind CSS. It powers the customer-facing storefront for the Ecommerce project.

## Built With
- Vite — dev server and build tooling
- React (18) + TypeScript — UI and type safety
- Tailwind CSS + PostCSS + Autoprefixer — utility-first styling
- React Router DOM — client-side routing
- Zustand — lightweight global state management (cart, session)
- Recharts — charts for any dashboards or analytics views
- Lucide React — icon components
- clsx — utility for conditional classNames

## Project Structure (high level)

- `index.html` — app entry
- `src/` — application source code
  - `pages/` — top-level route pages (Home, Products, Cart, Checkout, Auth, Admin dashboard)
  - `components/` — reusable UI components (Header, Footer, ProductCard, Modal, Form controls)
  - `routes/` — route definitions and protected-route wrappers
  - `store/` or `state/` — Zustand stores (cart, user/session)
  - `styles/` — Tailwind entry and global styles
  - `assets/` — static assets (images, icons)

Note: file/folder names may vary; adapt to the repository layout.

## Key Components & Responsibilities
- Routing: `react-router-dom` sets up public and protected routes for user and admin areas.
- Global State: `zustand` manages cart contents, minimal session state, and UI flags.
- UI Components:
  - `Header` / `Nav` — navigation, search, cart badge
  - `Footer` — supporting links and site info
  - `ProductCard` / `ProductGrid` — product listing and preview
  - `ProductDetail` — product page with images, specs, add-to-cart
  - `Cart` / `CartItem` — edit quantities, remove items
  - `Checkout` — address/payment summary and submission
  - `Auth` components — login/signup/OTP flows
  - `Admin` views — dashboard charts (Recharts), product and order management
- Icons: `lucide-react` provides SVG icon components used in buttons and nav.
- Styling: Tailwind utility classes with `clsx` for conditional classes.

## Scripts
Install dependencies in the frontend project and run:

```bash
pnpm install
pnpm dev      # start Vite dev server
pnpm build    # run TypeScript build + Vite production build
pnpm preview  # preview production build locally
pnpm typecheck # run TypeScript type-checking
```

If you use `npm` or `yarn`, adapt the commands accordingly.

## Environment & Configuration
- The frontend typically reads configuration (API base URL, feature flags) from environment variables or a `.env` file consumed by Vite. Example variables:
  - `VITE_API_URL` — backend API base URL
  - `VITE_ANALYTICS_KEY` — analytics or other third-party keys

Add a `.env.local` or `.env` in the project root for local overrides (do not commit secrets).

## Running Locally
1. From the repository root, change to the frontend project folder:

```bash
cd frontend/project-bolt-sb1-sxjjgx29/project
pnpm install
pnpm dev
```

2. Open the dev server URL shown in the terminal (usually `http://localhost:5173`).

3. Ensure the backend API is running and `VITE_API_URL` points to it, or use a proxy/mocking layer.

## Build & Deployment

`pnpm build` produces an optimized SPA in `dist/`. The included `Dockerfile` serves it with Nginx, provides a `/health` endpoint, applies browser security headers, proxies `/api` and `/uploads` to the API container, and correctly falls back to `index.html` for client-side routes.

For the complete local container stack:

```bash
cd ../../../backend
cp .env.example .env
docker compose up --build
```

Open `http://localhost:8080`. Before an internet-facing deployment, replace every placeholder in `backend/.env`, set `NODE_ENV=production`, `COOKIE_SECURE=true`, production `CLIENT_ORIGINS`, real JWT secrets, SMTP, Cloudinary, and a managed MongoDB replica set. Do not use the demonstration Docker Compose database as the production database.

## Production safeguards included

- API access tokens live only in memory; the refresh token stays in an `httpOnly` cookie.
- Session restoration waits before protected routes redirect, avoiding stale browser sessions.
- Rich product descriptions are allow-list sanitized before being rendered.
- Customer profile changes, password changes, administrator password changes, store settings, and newsletter opt-ins use real API endpoints.
- Recently viewed products, keyboard skip navigation, and a back-to-top control are included as storefront enhancements.

## Testing & Linting
- This project includes TypeScript type-checking via `tsc` (`pnpm typecheck`).
- Add unit and integration tests (Jest, React Testing Library) as needed for components and pages.

## Contributing
- Keep components small and focused; prefer composable primitives.
- Use Tailwind utility classes and `clsx` for conditional styling.
- Add new global state to a dedicated `zustand` store file and keep stores minimal.

## Troubleshooting
- If styles don't reflect changes, restart the Vite dev server (Tailwind JIT can be sensitive to config changes).
- If API calls fail, confirm `VITE_API_URL` and CORS on the backend.

---

If you'd like, I can update this README to include a repository-specific file map and exact component locations — tell me whether you prefer a concise overview or a full file-by-file index.
