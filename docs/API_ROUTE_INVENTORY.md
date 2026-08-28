# API Route Inventory

Canonical base URL: `/api`. Every operation is also available under `/api/v1`. Total canonical operations: **76** (including health and readiness).

All successful operations use `{ success, message, data }`; list operations use `data.items` and `data.pagination`. All failed operations use `{ success: false, code, message, requestId, details? }`. Unless a row says otherwise, malformed body/query values return `422`, missing/wrong credentials return `401`, and inaccessible/missing resources return the documented service error (`403`, `404`, or `409`). Full input validation lives beside each router in `*.validation.ts`.

Status meaning: **CONNECTED** has a rendered frontend consumer; **CLIENT ONLY** has a typed client method but no current page/component consumer; **BACKEND ONLY** has no client consumer and is an intentional or current UI gap.

## Platform

| # | Method | Endpoint | Auth | Request / response | Backend | Frontend | Status |
|---:|---|---|---|---|---|---|---|
| 1 | GET | `/health` | Public | none -> health status/timestamp | `app.ts` | — | BACKEND ONLY (probe) |
| 2 | GET | `/ready` | Public | none -> database readiness, 200/503 | `app.ts`, db config | — | BACKEND ONLY (probe) |

## User authentication — `userAuth.routes.ts`, `userAuth.service.ts`, `User` / `Otp`

| # | Method | Endpoint | Auth | Request / response | Frontend consumer | Status |
|---:|---|---|---|---|---|---|
| 3 | POST | `/auth/signup` | Public, rate-limited | name, password, email or phone -> unverified user; 201 | `SignupPage` | CONNECTED |
| 4 | POST | `/auth/send-otp` | Public, OTP rate-limited | identifier, purpose signup/login/reset -> confirmation | `SignupPage` | CONNECTED |
| 5 | POST | `/auth/verify-otp` | Public | identifier, purpose, 6-digit OTP -> verified user or reset confirmation | `SignupPage`, `ForgotPasswordPage` | CONNECTED |
| 6 | POST | `/auth/login` | Public, rate-limited | identifier, password -> OTP challenge | `LoginPage` | CONNECTED |
| 7 | POST | `/auth/verify-login-otp` | Public | identifier, login purpose, OTP -> access token and refresh cookie | `LoginPage` | CONNECTED |
| 8 | POST | `/auth/forgot-password` | Public, OTP rate-limited | identifier -> uniform reset request response | `ForgotPasswordPage` | CONNECTED |
| 9 | POST | `/auth/reset-password` | Public | identifier, new password after reset verification -> confirmation | `ForgotPasswordPage` | CONNECTED |
| 10 | POST | `/auth/refresh-token` | Refresh cookie | no body -> rotated access token and refresh cookie | Axios interceptor | CONNECTED |
| 11 | POST | `/auth/logout` | User | bearer token -> session invalidated | `UserMenu`, `ProfilePage` | CONNECTED |
| 12 | GET | `/auth/me` | User | none -> profile, addresses, wishlist | bootstrap and auth pages | CONNECTED |
| 13 | PATCH | `/auth/me` | User | name -> profile | `ProfilePage` | CONNECTED |
| 14 | POST | `/auth/change-password` | User | currentPassword, newPassword -> session invalidated | `ProfilePage` | CONNECTED |

## Administrator authentication — `adminAuth.routes.ts`, `adminAuth.service.ts`, `Admin` / `AuditLog`

| # | Method | Endpoint | Auth | Request / response | Frontend consumer | Status |
|---:|---|---|---|---|---|---|
| 15 | POST | `/admin/auth/login` | Public, rate-limited | email, password -> access token and refresh cookie | `AdminLoginPage` | CONNECTED |
| 16 | POST | `/admin/auth/create-sub-admin` | Primary admin | name, email, password -> sub-admin; 201 | — | BACKEND ONLY |
| 17 | POST | `/admin/auth/refresh-token` | Admin refresh cookie | no body -> rotated access token/cookie | Axios interceptor | CONNECTED |
| 18 | POST | `/admin/auth/logout` | Admin | bearer token -> session invalidated | `AdminSidebar` | CONNECTED |
| 19 | GET | `/admin/auth/me` | Admin | none -> administrator profile | bootstrap / `AdminLoginPage` | CONNECTED |
| 20 | POST | `/admin/auth/change-password` | Admin | currentPassword, newPassword -> session invalidated | `AdminSettingsPage` | CONNECTED |

## Categories — `category.routes.ts`, `category.service.ts`, `Category` / `AuditLog`

| # | Method | Endpoint | Auth | Request / response | Frontend consumer | Status |
|---:|---|---|---|---|---|---|
| 21 | GET | `/categories` | Public | none -> active category tree | catalogue store / navigation | CONNECTED |
| 22 | GET | `/categories/:slug` | Public | slug -> category, children, productCount | — | BACKEND ONLY |
| 23 | POST | `/categories` | Admin | name, parentCategory?, image?, isActive?, sortOrder? -> category; 201 | `AdminCategoriesPage` | CONNECTED |
| 24 | PUT | `/categories/:id` | Admin | mutable category fields -> category | `AdminCategoriesPage` | CONNECTED |
| 25 | DELETE | `/categories/:id` | Admin | id -> deletion confirmation; blocks referenced nodes/products | `AdminCategoriesPage` | CONNECTED |

## Products — `product.routes.ts`, `product.service.ts`, `Product` / `InventoryLog` / `AuditLog`

| # | Method | Endpoint | Auth | Request / response | Frontend consumer | Status |
|---:|---|---|---|---|---|---|
| 26 | GET | `/products` | Public | category, subCategory, brand, price, search, sort, page, limit -> paginated active products | `CatalogPage`, catalogue store | CONNECTED |
| 27 | GET | `/products/:slug/related` | Public | slug -> related active products | `ProductDetailPage` | CONNECTED |
| 28 | GET | `/products/:slug` | Public | slug -> product | `ProductDetailPage` | CONNECTED |
| 29 | POST | `/products` | Admin | multipart product schema, images/thumbnail -> product; 201 | `ProductFormPage` | CONNECTED |
| 30 | PUT | `/products/:id` | Admin | multipart partial product schema -> product | `ProductFormPage` | CONNECTED |
| 31 | DELETE | `/products/:id` | Admin | id -> soft archive confirmation | `AdminProductsPage` | CONNECTED |
| 32 | PATCH | `/products/:id/stock` | Admin | non-zero change, restock/correction, reference? -> product and inventory log | products/pages | CONNECTED |
| 33 | PATCH | `/products/:id/status` | Admin | active/draft/out-of-stock/archived -> product | `ProductFormPage` | CONNECTED |
| 34 | POST | `/products/:id/images` | Admin | multipart images, replace, thumbnailIndex? -> product | — | BACKEND ONLY |
| 35 | GET | `/products/:id/inventory-history` | Admin | id -> up to 100 inventory records | typed API client only | CLIENT ONLY |
| 36 | GET | `/admin/products` | Admin | product filters plus status -> paginated products | `AdminProductsPage`, `ProductFormPage` | CONNECTED |

## Cart — `cart.routes.ts`, `cart.service.ts`, `Cart` / `Product`

| # | Method | Endpoint | Auth | Request / response | Frontend consumer | Status |
|---:|---|---|---|---|---|---|
| 37 | GET | `/cart` | User | none -> cart with live product/price/availability flags | cart hydration | CONNECTED |
| 38 | POST | `/cart/add` | User | productId, quantity 1..99 -> cart | cart store | CONNECTED |
| 39 | PUT | `/cart/update` | User | productId, quantity 1..99 -> cart | cart store | CONNECTED |
| 40 | DELETE | `/cart/remove/:productId` | User | product id -> cart | cart store | CONNECTED |
| 41 | DELETE | `/cart/clear` | User | none -> confirmation | cart store / checkout | CONNECTED |

## Orders — `order.routes.ts`, `order.service.ts`, `Order` / `Cart` / `Product` / `Coupon` / `InventoryLog`

| # | Method | Endpoint | Auth | Request / response | Frontend consumer | Status |
|---:|---|---|---|---|---|---|
| 42 | POST | `/orders` | User | addressId, couponCode? -> server-priced COD order; 201 | `CheckoutPage` | CONNECTED |
| 43 | GET | `/orders/my-orders` | User | page, limit -> paginated own orders | `OrdersPage`, `ProfilePage` | CONNECTED |
| 44 | GET | `/orders/my-orders/:id` | User | own order id -> order | `OrderDetailPage` | CONNECTED |
| 45 | PATCH | `/orders/my-orders/:id/cancel` | User | optional note -> cancelled order | `OrderDetailPage` | CONNECTED |
| 46 | GET | `/orders` | Admin | page, limit, status?, from?, to? -> paginated orders | `AdminOrdersPage` | CONNECTED |
| 47 | GET | `/orders/:id` | Admin | id -> order | `AdminOrderDetailPage` | CONNECTED |
| 48 | PATCH | `/orders/:id/status` | Admin | next status, optional note -> order | `AdminOrderDetailPage` | CONNECTED |

## Reviews — `review.routes.ts`, `review.service.ts`, `Review` / `Product` / `Order`

| # | Method | Endpoint | Auth | Request / response | Frontend consumer | Status |
|---:|---|---|---|---|---|---|
| 49 | GET | `/reviews/product/:productId` | Public | product id -> approved reviews | `ProductDetailPage` | CONNECTED |
| 50 | POST | `/reviews/product/:productId` | User | rating, title?, comment -> review; 201 | `ReviewSection` | CONNECTED |
| 51 | PUT | `/reviews/:id` | Review owner | partial rating/title/comment -> review | typed API client only | CLIENT ONLY |
| 52 | DELETE | `/reviews/:id` | Owner or admin | id -> confirmation | typed API client only | CLIENT ONLY |
| 53 | PATCH | `/reviews/:id/moderate` | Admin | isApproved -> review | typed API client only | CLIENT ONLY |

## Newsletter and coupons

| # | Method | Endpoint | Auth | Request / response | Backend | Frontend consumer | Status |
|---:|---|---|---|---|---|---|---|
| 54 | POST | `/newsletter/subscribe` | Public, rate-limited | email, marketingConsent true -> subscriber; 201 | newsletter service / model | footer | CONNECTED |
| 55 | POST | `/coupons/apply` | User | code -> server discount and grand total | coupon/cart services | `CartPage` | CONNECTED |
| 56 | GET | `/coupons` | Admin | none -> coupons | coupon service / model | `AdminCouponsPage` | CONNECTED |
| 57 | POST | `/coupons` | Admin | coupon schema -> coupon; 201 | coupon service / audit | `AdminCouponsPage` | CONNECTED |
| 58 | PUT | `/coupons/:id` | Admin | partial coupon schema -> coupon | coupon service / audit | `AdminCouponsPage` | CONNECTED |
| 59 | DELETE | `/coupons/:id` | Admin | id -> deactivated confirmation | coupon service / audit | `AdminCouponsPage` | CONNECTED |

## Wishlist and addresses

| # | Method | Endpoint | Auth | Request / response | Frontend consumer | Status |
|---:|---|---|---|---|---|---|
| 60 | GET | `/wishlist` | User | none -> populated products | `WishlistPage`, store hydration | CONNECTED |
| 61 | POST | `/wishlist/add/:productId` | User | product id -> products | wishlist store | CONNECTED |
| 62 | DELETE | `/wishlist/remove/:productId` | User | product id -> confirmation | wishlist store | CONNECTED |
| 63 | GET | `/addresses` | User | none -> saved addresses | `AddressesPage`, `CheckoutPage` | CONNECTED |
| 64 | POST | `/addresses` | User | address schema -> address; 201 | `AddressesPage` | CONNECTED |
| 65 | PUT | `/addresses/:id` | User | partial address -> address | `AddressesPage` | CONNECTED |
| 66 | DELETE | `/addresses/:id` | User | id -> confirmation | `AddressesPage` | CONNECTED |
| 67 | PATCH | `/addresses/:id/set-default` | User | id -> address | `AddressesPage` | CONNECTED |

## Administrator operations

| # | Method | Endpoint | Auth | Request / response | Frontend consumer | Status |
|---:|---|---|---|---|---|---|
| 68 | GET | `/admin/dashboard/stats` | Admin | none -> counts/revenue | `DashboardPage` | CONNECTED |
| 69 | GET | `/admin/dashboard/revenue-chart` | Admin | period, from?, to? -> chart points | `RevenueChart` | CONNECTED |
| 70 | GET | `/admin/dashboard/top-products` | Admin | limit -> products | `DashboardPage` | CONNECTED |
| 71 | GET | `/admin/dashboard/low-stock` | Admin | threshold -> products | `DashboardPage` | CONNECTED |
| 72 | GET | `/admin/dashboard/recent-orders` | Admin | limit -> orders | `DashboardPage` | CONNECTED |
| 73 | GET | `/admin/settings` | Admin | none -> singleton settings | `AdminSettingsPage` | CONNECTED |
| 74 | PUT | `/admin/settings` | Admin | full settings schema -> settings | `AdminSettingsPage` | CONNECTED |
| 75 | GET | `/admin/users` | Admin | search?, verified?, page, limit -> paginated users | `AdminCustomersPage` | CONNECTED |
| 76 | PATCH | `/admin/users/:id/status` | Admin | isActive -> user | `AdminCustomersPage` | CONNECTED |

## Route-consumer summary

* Rendered frontend consumer: **67 / 76**.
* Client-only methods lacking a rendered workflow: **4 / 76** (`inventory-history`, review update/delete/moderate).
* Backend-only operations: **5 / 76** (health, readiness, category detail, product image-only upload, create sub-admin).
* No nonexistent frontend API calls were found in the source search.
