# ElectroMart Backend — Implementation Guide

This directory contains the complete TypeScript backend for the electronics e-commerce application described in `Readme.md`. It serves two independent clients:

- A customer storefront: account creation, OTP authentication, catalogue browsing, cart, checkout, orders, addresses, wishlist, coupons, and reviews.
- A separately authenticated administration portal: inventory and product management, category and coupon management, order fulfilment, customer controls, audit records, and dashboard analytics.

The compatible HTTP API is mounted under `/api`; `/api/v1` exposes the identical versioned contract for new clients. Interactive API documentation is available at `/api/docs`, liveness is available at `/api/health`, and readiness (including MongoDB connectivity) is available at `/api/ready`.

## Design and implementation philosophy

The code uses a modular monolith. A request flows through **route → middleware → controller → service → repository → Mongoose model**.

- Routes only declare endpoint and middleware order.
- Middleware authenticates, validates, limits requests, parses multipart payloads, and applies central error handling.
- Controllers only bridge HTTP with services and return the common response envelope.
- Services contain policy, state transitions, totals, ownership checks, OTP rules, and cross-module orchestration.
- Repositories contain database operations and aggregation pipelines. They never make policy decisions.
- Mongoose models encode durable constraints, indexes, and document shape.

This separation is intentional: high-risk workflows such as stock reservation or account access are easy to test and change without embedding business logic in Express handlers.

Every successful response has this shape:

```json
{ "success": true, "message": "…", "data": {} }
```

Every failure uses a consistent `success: false`, `code`, and `message` envelope. Validation failures return HTTP 422; bad identifiers and business-rule violations return suitable 4xx codes.

## Included implementation features

### Authentication and security

- Completely separate `User` and `Admin` models, JWT secrets, cookie names, and bearer-token middleware. A customer JWT cannot access an admin route.
- Short-lived access JWTs plus long-lived, `httpOnly` refresh cookies. Refresh tokens carry and atomically rotate a server-side session id, preventing their replay; logout and password changes increment `authVersion`, invalidating refresh sessions.
- Customer signup/login/reset OTP flows with SHA-256 OTP hashes, a ten-minute TTL index, single-use records, and a five-attempt cap.
- Passwords are hashed with bcrypt (12 rounds).
- Rate limiting for authentication and OTP routes.
- Helmet headers, scoped CORS allow-list, JSON body size limits, secure-by-configuration cookies, request logs, and centralized error handling.
- Structured logs redact bearer tokens, cookies, and refresh-cookie response headers. Error responses carry a request id for support correlation.
- The initial administrator has no public registration endpoint; create it with `pnpm seed:admin`.

### Catalogue, image, and inventory handling

- Arbitrarily nested category tree, slug generation, product/category integrity checks, and deletion guards.
- Product data supports electronics-specific specifications grouped by area, warranty terms, box contents, rich description, brand, SKU, categories, stock, rating aggregates, and featured/draft/archived states.
- Product listing supports category, subcategory, brand, price range, full-text search, sort, paging, related products, and appropriate database indexes.
- Product uploads accept JPEG/PNG/WebP/AVIF only, maximum 5 MB each and eight images per request.
- Multer writes safely to `public/uploads/products`. If `CLOUDINARY_URL` is configured, those files are also sent to Cloudinary and the durable Cloudinary URLs are stored. Without it, the locally served `/uploads/products/...` URL is stored. This gives development an immediate no-cloud path and production a cloud-media path.
- Atomic stock increments/decrements and immutable `InventoryLog` records for initial stock, restocks, corrections, orders, and cancellations.
- Soft-delete/archiving protects historical orders from product deletion.

### Cart, coupon, and COD order consistency

- Cart reads calculate live totals and flag price changes against each item's `priceAtAdd` snapshot.
- Adding/updating cart quantities validates current product stock.
- Checkout re-reads products, creates product/price/image/SKU snapshots, atomically reserves stock for each item, validates and consumes coupons, creates a COD-only order, then clears the cart.
- A failure in stock/coupon/order creation compensates by restoring any reserved stock and coupon usage. For horizontally distributed production deployments, run MongoDB as a replica set and replace this compensation boundary with a MongoDB transaction if fully atomic multi-document commits are required.
- Customer cancellation is allowed only while an order is `placed`; it restores stock and creates inventory entries.
- Admin fulfilment is a strict forward-only sequence: `placed → processing → shipped → delivered`.

### Customer and administration extras

- Saved addresses have one enforced default address.
- Wishlist only includes active products.
- A user gets `isVerifiedPurchase: true` on a review when they have a delivered order containing that product. One review per user/product is guaranteed by a compound unique index. Review changes recompute product ratings.
- Coupon rules include active date window, minimum cart total, percentage/flat value, optional maximum discount, and usage caps. Usage increments only after successful order creation.
- Redis is optional: when configured, it caches public category/product reads with short TTLs and explicit invalidation on catalogue mutations. Cache errors never fail commerce requests.
- Redis/BullMQ delivery runs in a separately deployable OTP worker. The API enqueues durable jobs; without Redis, local-development delivery is immediate. Production deliberately rejects simulated email/SMS delivery.
- Admin dashboard shows delivery-based revenue, orders, users, products, pending orders, charts, top sellers, low stock, and recent orders.
- Extra portal capabilities beyond the original route list: administrator profile endpoint, user search/disable control, review moderation, product image replacement, product inventory history, password change, and administrator audit records.

## Endpoint contract (68 commerce/portal routes, plus health and documentation)

`U` means authenticated customer bearer token. `A` means authenticated administrator bearer token. Refresh routes use their `httpOnly` cookie. All mutating JSON endpoints use Zod validation.

### Health and documentation

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Liveness status |
| GET | `/api/ready` | Public | Readiness status, including MongoDB connection |
| GET | `/api/docs` | Public | Swagger UI |

### Customer authentication — `/api/auth`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/signup` | Public | Create unverified account (`name`, `email` or `phone`, `password`) |
| POST | `/send-otp` | Public | Send signup/login/reset OTP (`identifier`, `purpose`) |
| POST | `/verify-otp` | Public | Verify signup or reset OTP; login OTP may also issue tokens |
| POST | `/login` | Public | Verify password and send login OTP |
| POST | `/verify-login-otp` | Public | Verify login OTP; receives access token and refresh cookie |
| POST | `/forgot-password` | Public | Dispatch reset OTP |
| POST | `/reset-password` | Public | Change password after reset OTP verification |
| POST | `/refresh-token` | Cookie | Rotate customer access/refresh tokens |
| POST | `/logout` | U | Invalidate customer refresh session |
| GET | `/me` | U | Current account/profile |
| POST | `/change-password` | U | Change password and require new sign-in |
| PATCH | `/me` | U | Update the account display name |

### Administrator authentication — `/api/admin/auth`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/login` | Public | Administrator email/password sign-in |
| POST | `/create-sub-admin` | A | Create a sub-administrator |
| POST | `/refresh-token` | Cookie | Rotate administrator tokens |
| POST | `/logout` | A | Invalidate administrator refresh session |
| GET | `/me` | A | Current administrator profile |
| POST | `/change-password` | A | Change administrator password and invalidate sessions |

### Categories — `/api/categories`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Public | Complete nested category tree |
| GET | `/:slug` | Public | Category, immediate children, product count |
| POST | `/` | A | Create category/subcategory |
| PUT | `/:id` | A | Update category or parent |
| DELETE | `/:id` | A | Delete only unused categories |

### Products and inventory — `/api/products`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Public | List/search/filter catalogue; `category`, `subCategory`, `brand`, `minPrice`, `maxPrice`, `search`, `sort`, `page`, `limit` |
| GET | `/:slug/related` | Public | Related active products |
| GET | `/:slug` | Public | Product detail |
| POST | `/` | A | Create multipart product (`images[]`, optional `thumbnail`) |
| PUT | `/:id` | A | Update product and optionally append files |
| DELETE | `/:id` | A | Soft-delete/archive product |
| PATCH | `/:id/stock` | A | Atomic inventory change (`change`, `reason`, `reference`) |
| PATCH | `/:id/status` | A | Set active/draft/out-of-stock/archived status |
| POST | `/:id/images` | A | Add or replace product images (`replace`, `thumbnailIndex`) |
| GET | `/:id/inventory-history` | A | Last 100 stock movements |

For multipart products, JSON array/object fields must be JSON strings: `subCategories`, `specifications`, `whatsInTheBox`, and `warranty`.

### Cart — `/api/cart`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/` | U | Current cart, live totals and availability/price warnings |
| POST | `/add` | U | Add/increment item (`productId`, `quantity`) |
| PUT | `/update` | U | Replace quantity (`productId`, `quantity`) |
| DELETE | `/remove/:productId` | U | Remove item |
| DELETE | `/clear` | U | Empty cart |

### Orders — `/api/orders`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/` | U | Place COD order (`addressId`, optional `couponCode`) |
| GET | `/my-orders` | U | Customer's paged orders |
| GET | `/my-orders/:id` | U | Customer order detail/timeline |
| PATCH | `/my-orders/:id/cancel` | U | Cancel a `placed` order |
| GET | `/` | A | Paged admin order list (`status`, `from`, `to`, `page`, `limit`) |
| GET | `/:id` | A | Any order detail |
| PATCH | `/:id/status` | A | Advance fulfilment state (`status`, optional `note`) |

### Reviews — `/api/reviews`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/product/:productId` | Public | Approved product reviews |
| POST | `/product/:productId` | U | Create one review (`rating`, `title?`, `comment`) |
| PUT | `/:id` | U owner | Edit own review |
| DELETE | `/:id` | U owner / A | Delete own review or moderation delete |
| PATCH | `/:id/moderate` | A | Set approval state |

### Coupons — `/api/coupons`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/apply` | U | Calculate current-cart discount without consuming it |
| GET | `/` | A | List coupons |
| POST | `/` | A | Create coupon |
| PUT | `/:id` | A | Update coupon |
| DELETE | `/:id` | A | Deactivate coupon |

### Wishlist — `/api/wishlist`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/` | U | Wishlist products |
| POST | `/add/:productId` | U | Add active product |
| DELETE | `/remove/:productId` | U | Remove product |

### Addresses — `/api/addresses`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/` | U | Saved addresses |
| POST | `/` | U | Add address |
| PUT | `/:id` | U owner | Update address |
| DELETE | `/:id` | U owner | Remove address |
| PATCH | `/:id/set-default` | U owner | Make one address default |

### Administration dashboard and customers

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/admin/dashboard/stats` | A | Revenue/order/user/product summary |
| GET | `/api/admin/dashboard/revenue-chart` | A | Delivery revenue by `day`, `week`, or `month` |
| GET | `/api/admin/dashboard/top-products` | A | Best sellers (`limit`) |
| GET | `/api/admin/dashboard/low-stock` | A | Products at/below `threshold` |
| GET | `/api/admin/dashboard/recent-orders` | A | Recent orders (`limit`) |
| GET | `/api/admin/users` | A | Search/page customers (`search`, `verified`, `page`, `limit`) |
| PATCH | `/api/admin/users/:id/status` | A | Activate/deactivate customer and revoke refresh sessions |
| GET | `/api/admin/settings` | A | Read persistent store/support/notification settings |
| PUT | `/api/admin/settings` | A | Update persistent store/support/notification settings |

### Newsletter — `/api/newsletter`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/subscribe` | Public | Store an explicit newsletter marketing opt-in; rate limited |

## Data collections and indexes

| Collection | Main integrity/index rules |
| --- | --- |
| `users` | Sparse unique email and phone; embedded addresses and wishlist; `authVersion` for refresh revocation |
| `admins` | Unique email; separate credential store and token scope |
| `otps` | TTL index on `expiresAt`; indexed identifier/purpose |
| `categories` | Unique slug; indexed parent/sort/name |
| `products` | Unique slug/SKU; full-text name/brand/description; category+price and active list indexes |
| `carts` | One cart per user; product price-at-add snapshot |
| `orders` | Unique order number; user/status+time indexes; product/order snapshots |
| `reviews` | Unique `{ product, user }`; product index |
| `coupons` | Unique uppercase code; active code lookup index |
| `inventorylogs` | Product/time history index |
| `auditlogs` | Administrator and entity/time trace indexes |
| `storesettings` | Singleton persistent support, notification, and storefront settings |
| `newslettersubscribers` | Unique opted-in newsletter addresses with consent timestamp |

## Local development

1. Copy the environment template and set real secrets:

   ```bash
   cp .env.example .env
   ```

2. Start MongoDB and Redis:

   ```bash
   docker compose up mongo redis -d
   ```

3. Install dependencies, synchronize indexes, create the initial admin, and run the API:

   ```bash
   corepack pnpm install
   corepack pnpm db:indexes
   corepack pnpm seed:admin
   corepack pnpm dev
   ```

   If `REDIS_URL` is set outside Docker Compose, start the independently scalable OTP worker in a second terminal:

   ```bash
   corepack pnpm worker
   ```

4. Browse `http://localhost:5000/api/docs` or call `GET /api/health`.

### Environment variables

Required outside development: `MONGODB_URI`, all four JWT secrets, `CLIENT_ORIGINS`, `COOKIE_SECURE=true`, and real initial-admin values. Placeholder/default credentials are rejected in production. `SMTP_*` enables email OTP delivery; with SMTP omitted, email OTPs are logged only for local development and phone OTP delivery is intentionally simulated only for that demo flow. `CLOUDINARY_URL` enables cloud image persistence. `REDIS_URL` enables BullMQ OTP jobs and `CACHE_TTL_SECONDS` (default `60`, `0` disables caching) controls public catalogue caching.

### Docker deployment

`Dockerfile` builds the TypeScript source to `dist`, runs as the unprivileged Node user, and contains a liveness health check. `docker-compose.yml` now also builds the frontend Nginx image and serves the full stack at `http://localhost:8080`; it proxies browser `/api` and `/uploads` requests to the API service. It remains a local/development topology. For production, use a managed Mongo replica set, durable cloud media (`CLOUDINARY_URL`), real SMTP, TLS termination, secure cookies, secret injection, backups, and a production frontend origin allow-list.

## Quality checks

```bash
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

The test suite verifies the health/versioned prefixes, standard error envelope/request id, query-boundary validation, token-scope separation, and primary-admin authorization without a database. The design keeps repositories injectable/isolated so the business flows can be expanded with MongoDB integration tests (for example using `mongodb-memory-server`) without altering route code.
