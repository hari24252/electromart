# Full Stack Integration Plan

## 1. Discovered architecture

```text
Browser
  -> React 18 / Vite router and Zustand stores
  -> Axios client (`src/api/client.ts`)
  -> `/api` same-origin proxy (Vite in development, Nginx in containers)
  -> Express 5 modular API (`backend/src/app.ts`)
  -> authentication, validation, upload, rate-limit, and error middleware
  -> controller -> service -> repository -> Mongoose model
  -> MongoDB
  -> response envelope -> API normalizer -> Zustand/component state -> UI
```

| Concern | Actual implementation |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router 6, Zustand, Axios, Tailwind |
| Backend | Node.js, TypeScript, Express 5, modular monolith |
| Primary database | MongoDB through Mongoose |
| Cache / queue | Optional Redis through ioredis; BullMQ only when Redis is configured |
| Storage | Local product uploads, optionally Cloudinary |
| Email | Nodemailer SMTP; OTP jobs are queued when Redis exists |
| Auth | Separate user/admin JWT signing secrets; access token in memory, rotating refresh token in an httpOnly cookie |
| Operations | Docker Compose provides MongoDB, Redis, API, worker, and Nginx storefront |
| Tests | Vitest/Supertest backend boundary tests; no frontend test runner is configured |

The published API has compatible `/api` and `/api/v1` prefixes. The inventory counts one canonical `/api` contract, not both aliases.

## 2. Existing integration contract

* Success: `{ success: true, message, data }`.
* Pagination: `data.items` plus `data.pagination.{page,limit,total,pages}`.
* Failure: `{ success: false, code, message, requestId, details? }`.
* API client: `frontend/project-bolt-sb1-sxjjgx29/project/src/api/client.ts`; it sends user/admin access tokens according to request scope, sends cookies, and performs one coalesced refresh per scope after a 401.
* Media: product forms use `FormData`; `/uploads` paths are resolved against `VITE_API_URL` for split-origin deployments.

## 3. Authentication flow

```text
User: credentials -> login password check -> OTP -> verify-login-otp
  -> access token (memory) + user_refresh httpOnly cookie
  -> Authorization bearer token -> authenticateUser

Administrator: credentials -> admin login
  -> access token (memory) + admin_refresh httpOnly cookie
  -> Authorization bearer token -> authenticateAdmin

Expired access token -> Axios interceptor -> scope-specific refresh cookie endpoint
  -> rotate refresh session -> retry once -> logout/redirect only if refresh fails
```

Frontend route guards improve UX only. Each protected backend route independently applies `authenticateUser`, `authenticateAdmin`, or `authenticateAny`.

## 4. Data relationships

* `User` owns embedded addresses and wishlist references; it owns one `Cart` and many `Order` records.
* `Product` references a primary `Category` and optional subcategories; it has `InventoryLog` and `Review` records.
* `Order` snapshots products and address data, optionally snapshots a coupon, and records status history.
* `Admin` is the actor for `AuditLog`, inventory changes, and privileged mutations.
* `Otp` is hashed, attempt-limited, and TTL-indexed. `NewsletterSubscriber` and `StoreSettings` are independent records.

## 5. Delivery phases

1. Preserve the documented contracts and remove security-sensitive response/logging leakage.
2. Ensure the one Axios client normalizes failures and handles authenticated mutations consistently.
3. Replace production-masking mock/fallback behaviour with explicit loading, empty, and error states for core catalogue/cart/product flows.
4. Connect currently uncovered existing management operations through existing admin/product/review surfaces where practical.
5. Add route-focused integration coverage, then validate production containers and runtime dependencies.

## 6. Verification baseline — 2026-08-25

| Check | Result |
|---|---|
| Backend `pnpm test` | Pass — 3 files, 9 tests |
| Backend `pnpm run typecheck` | Pass |
| Backend `pnpm run build` | Pass |
| Frontend `pnpm run typecheck` | Pass |
| Frontend `pnpm run build` | Pass |
| Full database, SMTP, Redis, Cloudinary journeys | Not yet verified; they require safe configured services |

There is no lint script in either package manifest and no frontend test script. These are coverage/tooling gaps, not passing checks.
