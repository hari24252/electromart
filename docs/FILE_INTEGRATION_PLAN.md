# File Integration Plan

Only files with a concrete integration, security, observability, or verification need are listed. Existing architecture and route contracts will be preserved.

| File | Purpose / current behavior | Required integration or risk | Dependencies | Tests required | Status |
|---|---|---|---|---|---|
| `backend/src/modules/user-auth/userAuth.controller.ts` | Sets refresh cookie and currently serializes service token pair | Return only access token while retaining the refresh token solely in the cookie | token helpers, frontend client | login/refresh cookie and body assertions | Pending |
| `backend/src/modules/admin-auth/adminAuth.controller.ts` | Same admin token flow | Keep refresh token out of JSON response | token helpers, frontend client | admin login/refresh assertions | Pending |
| `backend/src/config/mail.ts` | SMTP/phone OTP fallback logs OTP in development | Remove OTP value from logs; retain safe delivery diagnostics | queue, env, logger | email unavailable behaviour | Pending |
| `backend/src/config/env.ts` | Validates production inputs but development defaults include an initial admin credential | Require intentional initial-admin configuration; production must reject blank/default bootstrap values | db config, seed script, compose | production env validation | Pending |
| `backend/src/config/db.ts` | Connects DB and auto-seeds first admin | Seed only when explicit bootstrap settings are supplied | env, Admin | initial admin optional/no-secret behaviour | Pending |
| `backend/src/scripts/seedAdmin.ts` | Manual admin seeding assumes credential variables exist | Fail safely with a clear configuration error rather than using defaults | env, db | manual invocation validation | Pending |
| `backend/docker-compose.yml` | Development stack presently supplies default administrator credentials | Remove credentials from Compose defaults so production cannot start with known login values | Dockerfile, `.env.example` | Compose config / production start preflight | Pending |
| `frontend/.../src/api/client.ts` | Central Axios setup and error extraction | Preserve scoped retry; normalize backend error details and avoid cross-scope request mistakes | auth store, API services | interceptor unit/integration coverage | Review |
| `frontend/.../src/stores/dataStore.ts` | Uses mock data after live catalogue failures | Track and expose actual fetch error instead of masking a production outage | API services, `CatalogPage` | API success, empty, failure state | Pending |
| `frontend/.../src/pages/store/CatalogPage.tsx` | Shows loading and empty states but not live API failure | Render a retryable API-error state | data store | visual/typecheck coverage | Pending |
| `frontend/.../src/pages/store/ProductDetailPage.tsx` | Falls back to cached/mock product after detail failures | Distinguish real 404 from service outage and show retryable error | API service, data store | 404 and network failure state | Pending |
| `frontend/.../src/stores/cartStore.ts` | Optimistically updates and silently ignores server failures | Reconcile/rollback state on failed authenticated mutation and expose mutation status/error | auth store, cart API | stock conflict / network failure | Pending |
| `frontend/.../src/stores/wishlistStore.ts` | Optimistically updates and silently ignores server failures | Roll back failed authenticated mutation | auth store, wishlist API | duplicate/network failure | Pending |
| `frontend/.../src/api/services.ts` | Typed API facade | Add only existing uncovered methods that gain a UI consumer; ensure admin scope is explicit | client/types | request path/scope coverage | Pending |
| `frontend/.../src/components/store/ReviewSection.tsx` | Lists and creates reviews | Connect owner update/delete behaviour and surface mutation errors; do not invent helpful-vote API | review routes/auth store | owner vs non-owner authorization | Pending |
| `frontend/.../src/pages/admin/ProductFormPage.tsx` | Existing product management surface | Add existing inventory-history and review-moderation consumers if UI design permits | product/review API, types | authenticated admin calls | Pending |
| `backend/tests/*.test.ts` plus new API integration tests | Current coverage is HTTP boundary/token only | Add DB-backed critical journey and no-refresh-token-response tests without using personal DB | MongoMemoryServer / test env | auth, cart, checkout, admin route coverage | Pending |
| `frontend/.../package.json` and tests | No test runner/script exists | Add a minimal frontend test setup only if necessary for reliable client/store tests | Vite/React | client/store/component tests | Decision pending |

## Risks and out-of-scope conditions

* SMTP, Redis, Cloudinary, and a durable production MongoDB deployment cannot be verified locally without real non-secret configuration and a reachable service. They will be marked accurately, not simulated as production success.
* The API has no audit-log read endpoint, no newsletter administration endpoint, and no standalone media delete endpoint. A frontend page for those cannot be connected without creating backend capability, which is outside the existing-contract scope.
* Only the primary admin can create sub-admins. Any rendered workflow must enforce that role in the UI while the backend remains authoritative.
