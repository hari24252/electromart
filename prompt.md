# MASTER EXECUTION PROMPT — FULL STACK WIRING & END-TO-END INTEGRATION

You are working inside an ALREADY BUILT full-stack ecommerce application.

Your job is NOT to redesign it.
Your job is NOT to rebuild it.
Your job is NOT to invent new architecture.

The frontend and backend already exist and are substantially complete.

YOUR ONLY PRIMARY OBJECTIVE:

> Wire the existing React frontend to the existing Express/Mongoose backend correctly and make the entire application work end-to-end.

\============================================================
0\. SOURCE OF TRUTH
===================

The repository contains these authoritative documents:

- docs/FULL\_STACK\_INTEGRATION\_PLAN.md
- docs/FRONTEND\_BACKEND\_MAPPING.md
- docs/FILE\_INTEGRATION\_PLAN.md
- docs/INTEGRATION\_CHECKLIST.md
- docs/API\_ROUTE\_INVENTORY.md

Read all five before modifying integration code.

Do NOT guess what an endpoint does.

Do NOT invent routes.

Do NOT invent request/response shapes.

Do NOT replace an existing implementation merely because you prefer another architecture.

The existing source code + the five documents are the source of truth.

The integration checklist is the execution checklist.

\============================================================

1. CURRENT APPLICATION ARCHITECTURE
   \============================================================

Frontend:

React 18
TypeScript
React Router
Zustand
Axios
Tailwind

Frontend flow:

Page/component
-> API service
-> Axios client
-> /api
-> Express backend
-> middleware
-> controller
-> service
-> repository/model
-> MongoDB
-> standard API envelope
-> frontend normalizer
-> Zustand/component state
-> UI

Backend:

Node.js
TypeScript
Express 5
Mongoose
MongoDB

Existing API contract:

SUCCESS:

{
success: true,
message,
data
}

PAGINATION:

data.items
data.pagination.page
data.pagination.limit
data.pagination.total
data.pagination.pages

FAILURE:

{
success: false,
code,
message,
requestId,
details?
}

Preserve this contract.

\============================================================
2\. IMPORTANT — REMOVE OTP, REDIS AND BULLMQ
============================================

OTP IS NOT REQUIRED.

REDIS IS NOT REQUIRED.

BULLMQ IS NOT REQUIRED.

Remove them completely from the application.

Do not leave half-integrated/dead implementations behind.

***

## OTP REMOVAL

Remove OTP from the authentication workflow.

Customer authentication becomes:

signup
-> password validation/hash
-> account creation
-> authenticated session

login
-> password verification
-> access token
-> refresh-token httpOnly cookie

forgot password
-> secure password-reset mechanism already supported by the existing application
-> reset password

Do NOT invent an OTP replacement.

If the existing backend already has a password reset/token mechanism, wire that existing mechanism.

If the existing application does not have a reset mechanism, do not invent an unrelated architecture. Preserve the existing documented contract and report the exact missing capability.

Remove:

- OTP routes
- OTP controllers/services where no longer used
- OTP models
- OTP queues
- OTP mail logic
- OTP verification UI
- OTP-specific frontend API calls
- OTP environment variables
- OTP logging
- OTP-related imports
- OTP-related worker jobs
- OTP-related tests that are no longer applicable

Update authentication UI so there is no OTP step.

IMPORTANT:

Do not delete normal email functionality merely because OTP is removed.

***

## REDIS REMOVAL

Redis must not be a runtime dependency.

Remove:

- ioredis usage
- Redis configuration
- Redis connection initialization
- Redis health checks
- Redis cache dependency
- Redis environment variables
- Redis Docker service
- Redis-related startup dependencies
- Redis-related worker dependencies

If an existing service has Redis as an OPTIONAL optimization, make the service work correctly without Redis.

Do not replace Redis with another cache unless the existing application already provides that implementation.

Correctness > caching.

***

## BULLMQ REMOVAL

BullMQ must be removed.

Remove:

- BullMQ imports
- queue definitions
- workers
- queue processors
- queue environment configuration
- worker Docker/runtime configuration
- Redis/BullMQ dependencies
- OTP jobs
- queue startup logic

Email or other existing operations must work synchronously through the existing service implementation where appropriate.

Do not invent a new queue system.

***

## PACKAGE CLEANUP

After removal:

- update backend/package.json
- update lockfile appropriately
- remove unused dependencies
- remove unused imports
- remove obsolete worker files if they are only for removed queue functionality
- remove obsolete environment variables
- update docker-compose
- update Dockerfiles only where necessary
- update .env.example
- update documentation

The final backend must run without Redis or BullMQ.

\============================================================
3\. DO NOT REBUILD THE APPLICATION
==================================

The existing application is considered functionally built.

Do NOT:

- redesign pages
- replace the UI
- replace Zustand
- replace Axios
- replace Express
- replace Mongoose
- rewrite the API architecture
- create duplicate API clients
- create duplicate service layers
- create duplicate routes
- create mock APIs
- create fake database data
- create fake success responses
- silently fall back to mock catalogue data
- hide backend failures

Only modify code necessary to complete the integration.

\============================================================
4\. CENTRAL FRONTEND API RULE
=============================

There must be ONE frontend API client:

frontend/project-bolt-sb1-sxjjgx29/project/src/api/client.ts

There must be ONE feature API layer:

frontend/project-bolt-sb1-sxjjgx29/project/src/api/services.ts

All frontend API calls should flow through these.

Do not create scattered fetch/axios clients.

Preserve:

- base URL
- /api routing
- credentials/cookies
- Authorization headers
- user/admin auth scopes
- refresh handling
- standardized error extraction
- response normalization

Administrator routes that are not literally under /admin/\* but require admin authentication must explicitly use admin auth scope.

Backend authorization remains authoritative.

\============================================================
5\. AUTHENTICATION INTEGRATION
==============================

Use the existing JWT architecture.

Access token:

- memory only
- never localStorage
- never sessionStorage

Refresh token:

- httpOnly cookie
- scoped appropriately
- never returned in JSON

User and administrator sessions remain separated.

Frontend Axios interceptor must:

1. receive 401
2. identify request scope
3. perform the correct refresh endpoint
4. coalesce concurrent refreshes
5. retry the original request once
6. logout only when refresh fails

Never send an admin refresh token to a user refresh endpoint.

Never send a user refresh token to an admin refresh endpoint.

Remove OTP from every authentication path.

\============================================================
6\. INTEGRATION CHECKLIST IS THE EXECUTION PLAN
===============================================

Use:

docs/INTEGRATION\_CHECKLIST.md

Legend:

B = backend exists
F = frontend consumer exists
A = authentication tested
V = validation tested
S = success tested
E = error tested
I = full integration tested

The existing B/F marks are evidence of implementation.

The missing fields:

A—
V—
S—
E—
I—

are the work.

DO NOT blindly mark them complete.

For every applicable route:

1. Confirm frontend request exists.
2. Confirm request reaches the correct backend route.
3. Confirm request payload matches backend validation.
4. Confirm authentication scope is correct.
5. Confirm backend success response reaches frontend.
6. Confirm frontend normalizes the response correctly.
7. Confirm UI renders the returned data.
8. Test invalid input.
9. Test unauthorized/forbidden access where applicable.
10. Test backend/server failure.
11. Test frontend error handling.
12. Test the complete browser -> API -> DB -> response -> UI path.

Only then mark the corresponding checklist fields.

\============================================================
7\. ROUTES WITH F✓
==================

For every route marked:

B✓ F✓

DO NOT create a new frontend screen.

Find the existing consumer and wire it correctly.

Examples:

AUTH:

/auth/signup
/auth/login
/auth/me
/auth/refresh-token
/auth/logout
/auth/change-password

CATALOGUE:

/categories
/products
/products/:slug
/products/:slug/related

CART:

/cart
/cart/add
/cart/update
/cart/remove/:productId
/cart/clear

ORDERS:

/orders
/orders/my-orders
/orders/my-orders/:id
/orders/my-orders/:id/cancel

COUPONS:

/coupons
/coupons/apply
/coupons/:id mutations

WISHLIST:

/wishlist
/wishlist/add/:productId
/wishlist/remove/:productId

ADDRESSES:

/addresses
/addresses/:id
/addresses/:id/set-default

REVIEWS:

/reviews/product/:productId
/reviews/product/:productId

ADMIN:

/admin/dashboard/\*
/admin/products
/admin/orders
/admin/settings
/admin/users

For each one, make the existing UI actually consume the live backend.

\============================================================
8\. ROUTES WITH F—
==================

These routes currently have backend support but no rendered frontend consumer.

DO NOT automatically create pages.

Only expose them if an existing appropriate page/surface already exists.

Known examples:

/categories/:slug
/products/:id/images
/products/:id/inventory-history
/admin/auth/create-sub-admin
/reviews/:id
/reviews/:id/moderate

For each:

A. Check whether an existing page can naturally consume it.
B. If yes, wire it into that page.
C. If no, do not invent a large new feature.
D. Document it as backend-only/unconsumed.

Priority is completing existing application flows.

\============================================================
9\. REMOVE PRODUCTION-MASKING MOCK FALLBACKS
============================================

This is mandatory.

Current known problem:

dataStore.ts
CatalogPage.tsx
ProductDetailPage.tsx

must not silently substitute mock/catalogue data when live API requests fail.

Correct behavior:

LOADING
-> loading UI

SUCCESS WITH DATA
-> render data

SUCCESS WITH EMPTY DATA
-> empty state

API ERROR
-> error state + retry

404
-> not-found state

NETWORK/SERVER FAILURE
-> service error + retry

Never turn:

"backend is down"

into:

"here is fake catalogue data."

\============================================================
10\. CART INTEGRATION
=====================

cartStore.ts must correctly reconcile server state.

For:

add
update
remove
clear

handle:

SUCCESS:
local state matches server state.

FAILURE:
do not silently swallow the error.

If optimistic UI is retained:

mutation
-> optimistic state
-> API
-> success = keep/reconcile
-> failure = rollback/reload server state + show error

Handle stock conflicts correctly.

Do not allow local cart state to permanently diverge from MongoDB.

\============================================================
11\. WISHLIST INTEGRATION
=========================

wishlistStore.ts must follow the same rule.

Optimistic update is acceptable.

But:

API failure
-> rollback
-> expose error

Never silently swallow server failure.

\============================================================
12\. PRODUCT / CATALOGUE INTEGRATION
====================================

Verify:

GET /products

query/filter/search/pagination must map correctly.

Verify:

GET /products/:slug

Verify:

GET /products/:slug/related

Verify:

GET /categories

Frontend names must be normalized correctly.

Examples already documented:

recipientName -> fullName
postalCode -> pincode
shippingAddress -> address
startsAt -> startDate
expiresAt -> endDate
pagination.pages -> totalPages

Do not alter backend field names merely to avoid writing frontend normalization.

\============================================================
13\. PRODUCT ADMIN INTEGRATION
==============================

Existing admin product UI must correctly wire:

GET /admin/products
POST /products
PUT /products/:id
DELETE /products/:id
PATCH /products/:id/stock
PATCH /products/:id/status

Multipart/FormData must remain correct.

Do not manually JSON encode multipart requests.

Verify:

- image upload
- product creation
- product update
- stock update
- status update
- archive/delete behavior
- validation errors
- authorization errors
- server errors

\============================================================
14\. CATEGORY ADMIN INTEGRATION
===============================

Existing AdminCategoriesPage must correctly wire:

GET /categories
POST /categories
PUT /categories/:id
DELETE /categories/:id

Verify:

- admin scope
- validation
- success
- duplicate/conflict error
- unauthorized access
- UI refresh/reconciliation

\============================================================
15\. REVIEW INTEGRATION
=======================

Existing ReviewSection.tsx must correctly wire:

GET /reviews/product/:productId
POST /reviews/product/:productId

If existing UI naturally supports owner edit/delete, connect:

PUT /reviews/:id
DELETE /reviews/:id

If existing admin UI naturally supports moderation:

PATCH /reviews/:id/moderate

Do NOT invent helpful-vote functionality.

Owner permissions must remain backend-authoritative.

\============================================================
16\. CHECKOUT / ORDERS
======================

Wire the existing checkout flow end-to-end.

Flow:

customer
-> address
-> cart
-> checkout
-> POST /orders
-> backend validates stock/product/coupon
-> Order created
-> inventory updated
-> response
-> frontend order confirmation
-> cart reconciled

The frontend must never calculate the authoritative order total.

Server total is authoritative.

Test:

- valid order
- empty cart
- invalid address
- unavailable product
- insufficient stock
- invalid coupon
- expired coupon
- unauthorized request
- server error

\============================================================
17\. ADMIN ORDER FLOW
=====================

Wire:

GET /orders
GET /orders/:id
PATCH /orders/:id/status

Verify:

admin authentication
-> request
-> backend authorization
-> order mutation
-> inventory/audit behavior
-> response
-> admin UI update

Never allow a customer token to perform administrator order operations.

\============================================================
18\. ADMIN DASHBOARD
====================

Wire existing dashboard consumers:

/admin/dashboard/stats
/admin/dashboard/revenue-chart
/admin/dashboard/top-products
/admin/dashboard/low-stock
/admin/dashboard/recent-orders

Each widget must distinguish:

loading
success
empty
error

Do not display fabricated values when the API fails.

\============================================================
19\. ADMIN SETTINGS / USERS
===========================

Wire:

GET /admin/settings
PUT /admin/settings
GET /admin/users
PATCH /admin/users/:id/status

Verify:

admin scope
validation
success
error
UI reconciliation

\============================================================
20\. HEALTH / READINESS
=======================

Preserve:

GET /health
GET /ready

Do not connect these to normal storefront data fetching.

They are operational endpoints.

\============================================================
21\. SECURITY REQUIREMENTS
==========================

Never return refresh tokens in JSON.

Never log:

- passwords
- JWTs
- refresh tokens
- OTPs
- secrets
- SMTP passwords
- database credentials

Remove development default administrator credentials.

Require intentional administrator bootstrap configuration.

Do not commit secrets.

Use environment variables.

\============================================================
22\. DATABASE
=============

MongoDB remains the primary database.

Do not replace MongoDB.

Do not create fake repositories.

Use the existing models/services/repositories.

Integration tests must not use the user's personal production database.

Use an isolated test database such as MongoMemoryServer where appropriate.

\============================================================
23\. ERROR HANDLING
===================

Every frontend API operation must handle:

400 validation error
401 unauthenticated
403 forbidden
404 not found
409 conflict where applicable
429 rate limit where applicable
500 server error
network failure

Use the backend's:

success
code
message
requestId
details

Do not display raw stack traces to users.

Do not swallow errors.

Do not convert errors into fake successful data.

\============================================================
24\. TESTING STRATEGY
=====================

First run existing tests.

Backend:

pnpm typecheck
pnpm test
pnpm build

Frontend:

pnpm typecheck
pnpm build

Then add focused integration tests where missing.

Priority:

1. authentication
2. catalogue
3. product
4. cart
5. checkout/order
6. wishlist
7. reviews
8. admin
9. settings/users

Do not create hundreds of meaningless tests.

Test critical wiring paths.

\============================================================
25\. TEST THE ACTUAL APPLICATION FLOW
=====================================

The goal is not merely:

"TypeScript compiles."

The goal is:

Browser
-> frontend component
-> Zustand/store
-> services.ts
-> client.ts
-> /api
-> Express
-> middleware
-> controller
-> service
-> MongoDB
-> response envelope
-> client normalizer
-> store
-> component
-> visible UI

This complete path must work.

\============================================================
26\. NO GUESSING RULE
=====================

If you encounter uncertainty:

DO NOT GUESS.

Inspect:

1. route definition
2. controller
3. service
4. validation schema
5. model
6. frontend API service
7. consuming component
8. types

Then implement the smallest correct integration.

Never invent request fields.

Never invent response fields.

Never invent route names.

Never invent authentication behavior.

\============================================================
27\. FILES TO PRIORITIZE
========================

Backend:

backend/src/app.ts
backend/src/config/env.ts
backend/src/config/db.ts
backend/src/config/mail.ts
backend/src/modules/user-auth/userAuth.controller.ts
backend/src/modules/admin-auth/adminAuth.controller.ts
backend/src/scripts/seedAdmin.ts
backend/docker-compose.yml
backend/package.json
backend/.env.example

Frontend:

frontend/project-bolt-sb1-sxjjgx29/project/src/api/client.ts
frontend/project-bolt-sb1-sxjjgx29/project/src/api/services.ts
frontend/project-bolt-sb1-sxjjgx29/project/src/stores/dataStore.ts
frontend/project-bolt-sb1-sxjjgx29/project/src/stores/cartStore.ts
frontend/project-bolt-sb1-sxjjgx29/project/src/stores/wishlistStore.ts
frontend/project-bolt-sb1-sxjjgx29/project/src/pages/store/CatalogPage.tsx
frontend/project-bolt-sb1-sxjjgx29/project/src/pages/store/ProductDetailPage.tsx
frontend/project-bolt-sb1-sxjjgx29/project/src/components/store/ReviewSection.tsx
frontend/project-bolt-sb1-sxjjgx29/project/src/pages/admin/ProductFormPage.tsx
frontend/project-bolt-sb1-sxjjgx29/project/src/pages/admin/AdminLoginPage.tsx

Also modify any directly related consumer files when required to complete a route.

Do not limit yourself artificially to this list if an existing consumer requires a related file.

\============================================================
28\. EXECUTION ORDER
====================

PHASE 1 — REMOVE UNWANTED INFRASTRUCTURE

Remove:

OTP
Redis
BullMQ
worker dependency
OTP UI
OTP API calls
OTP environment variables
Redis environment variables
BullMQ configuration

Then:

typecheck
test
build

Fix removal regressions before continuing.

***

PHASE 2 — AUTHENTICATION

Complete:

signup
login
refresh
logout
me
profile
change password
forgot/reset password

User and admin scopes must remain separated.

***

PHASE 3 — CENTRAL API WIRING

Verify:

client.ts
services.ts
normalizers
error handling
refresh handling
multipart handling

No scattered API clients.

***

PHASE 4 — STOREFRONT

Complete:

categories
products
search
filter
pagination
product detail
related products
reviews

Remove mock fallback behavior.

***

PHASE 5 — CUSTOMER STATE

Complete:

cart
wishlist
addresses
profile

Implement proper rollback/error handling.

***

PHASE 6 — CHECKOUT

Complete:

coupon
checkout
order creation
order list
order detail
order cancellation

Verify server-authoritative totals.

***

PHASE 7 — ADMIN

Complete:

admin login
dashboard
products
categories
orders
coupons
customers
settings

Use admin auth scope everywhere required.

***

PHASE 8 — OPTIONAL EXISTING BACKEND CAPABILITIES

Only connect:

inventory history
image-only upload
review moderation
review owner edit/delete
sub-admin creation

when there is an appropriate existing UI surface.

Do not create unnecessary new architecture.

***

PHASE 9 — VERIFICATION

Run:

backend typecheck
backend tests
backend build
frontend typecheck
frontend build

Then perform route-focused integration verification.

***

PHASE 10 — DOCUMENTATION

Update:

docs/INTEGRATION\_CHECKLIST.md

For each route, accurately record:

B
F
A
V
S
E
I

Do not mark I✓ merely because code compiles.

I✓ means:

frontend -> backend -> database/service -> response -> frontend UI

has been verified.

Create/update:

docs/INTEGRATION\_EXECUTION\_REPORT.md

Include:

1. routes wired
2. files changed
3. OTP removal
4. Redis removal
5. BullMQ removal
6. authentication wiring
7. storefront wiring
8. cart/order wiring
9. admin wiring
10. tests executed
11. build/typecheck results
12. remaining unchecked routes
13. exact reason for every remaining unchecked item

\============================================================
29\. FINAL DEFINITION OF DONE
=============================

The task is COMPLETE only when:

\[ ] OTP removed
\[ ] Redis removed
\[ ] BullMQ removed
\[ ] worker no longer required
\[ ] no fake/mock fallback masks API failure
\[ ] one Axios client is used
\[ ] one frontend API service layer is used
\[ ] user authentication works
\[ ] admin authentication works
\[ ] refresh rotation works
\[ ] refresh token never appears in JSON
\[ ] catalogue works
\[ ] product detail works
\[ ] product management works
\[ ] categories work
\[ ] cart works
\[ ] wishlist works
\[ ] addresses work
\[ ] coupons work
\[ ] checkout works
\[ ] customer orders work
\[ ] admin orders work
\[ ] reviews work
\[ ] dashboard works
\[ ] settings work
\[ ] customer management works
\[ ] errors are visible and recoverable
\[ ] unauthorized requests are rejected
\[ ] validation works
\[ ] backend typecheck passes
\[ ] backend tests pass
\[ ] backend build passes
\[ ] frontend typecheck passes
\[ ] frontend build passes
\[ ] integration checklist updated
\[ ] integration execution report written

\============================================================
30\. CRITICAL FINAL RULE
========================

DO NOT STOP AFTER MAKING THE CODE COMPILE.

DO NOT SAY "integration complete" because TypeScript passes.

DO NOT mark unchecked checklist items complete without testing them.

DO NOT rebuild working features.

DO NOT invent missing APIs.

DO NOT add OTP.

DO NOT add Redis.

DO NOT add BullMQ.

DO NOT add unnecessary infrastructure.

DO NOT use mock data to hide failures.

DO NOT leave silent catch blocks around API mutations.

The objective is simple:

TAKE THE EXISTING FRONTEND.
TAKE THE EXISTING BACKEND.
WIRE THEM TOGETHER.
REMOVE OTP/REDIS/BULLMQ.
MAKE EVERY EXISTING CORE USER AND ADMIN FLOW ACTUALLY WORK END-TO-END.
VERIFY IT.
UPDATE THE CHECKLIST.
WRITE THE EXECUTION REPORT.

Work sequentially.
Make small, targeted changes.
After each phase, run the relevant checks.
Fix regressions immediately.
Never guess when the repository can provide the answer.
