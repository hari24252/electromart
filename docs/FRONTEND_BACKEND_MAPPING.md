# Frontend ↔ Backend Mapping

## Shared request path

```text
Page/component -> `api` service -> Axios client -> `/api` -> Express route
  -> auth/validation middleware -> controller -> service -> repository/model
  -> standard envelope -> normalizer -> Zustand/local state -> UI state
```

`src/api/services.ts` is the single feature API layer. It normalizes MongoDB-shaped records into the frontend `types/index.ts` contract. `src/api/client.ts` owns base URL, cookies, authorization headers, refresh rotation, and failure messages.

| Feature | Frontend page/component/store | API contract | Backend flow | Integration state |
|---|---|---|---|---|
| Bootstrap sessions | `App.tsx`, auth/cart/wishlist stores | user/admin `me`, refresh on 401, cart/wishlist reads | auth middleware -> auth/cart/wishlist services -> User/Cart | Connected |
| Registration and verification | `SignupPage` | signup, send OTP, verify OTP | user auth -> Otp/SMTP-or-queue -> User | Connected; delivery provider still environment-dependent |
| Customer login/password recovery | `LoginPage`, `ForgotPasswordPage` | login, verify login OTP, forgot/reset password | user auth -> Otp -> User/refresh cookie | Connected |
| Admin login | `AdminLoginPage` | admin login, me, refresh | admin auth -> Admin/refresh cookie | Connected |
| Catalogue/search/filter/pagination | `CatalogPage`, `FilterSidebar`, data store | categories, products | category/product services -> cache -> Category/Product | Connected |
| Product details/related/reviews | `ProductDetailPage`, `ReviewSection` | detail, related, list/create review | product/review services -> Product/Review/Order | Connected for view/create; review edit/delete/moderation lacks UI |
| Product management | admin products/editor pages | admin list, create/update multipart, archive, stock, status | admin auth -> upload/parser -> product service -> Product/InventoryLog/AuditLog | Connected; dedicated image-only route and history view are not surfaced |
| Category management | `AdminCategoriesPage` | tree, create/update/delete | category service -> Category/cache/AuditLog | Connected; single-category detail is unused |
| Cart | cart store, drawer, `CartPage` | read/add/update/remove/clear | cart service -> Cart/Product | Connected; authenticated changes need visible rollback/error handling hardening |
| Coupon | `CartPage`, `CouponInput` | apply and admin CRUD | coupon/cart/order services -> Coupon | Connected |
| Checkout and customer orders | `CheckoutPage`, orders pages | address CRUD, create/list/detail/cancel order | order service -> Cart/Product/Coupon/Order/InventoryLog | Connected; total stays server-calculated |
| Wishlist | wishlist store/page | list/add/remove | wishlist service -> User/Product | Connected |
| Customer profile/addresses | profile and addresses pages | me/update password/profile, address CRUD | user auth/address service -> User | Connected |
| Newsletter | storefront footer | subscribe | rate limit -> newsletter service -> Subscriber | Connected |
| Admin dashboard | dashboard/chart | stats/revenue/top/stock/recent | dashboard service -> Product/Order/User | Connected |
| Admin orders | admin order pages | list/detail/advance status | order service -> Order/InventoryLog/AuditLog | Connected |
| Admin customers/settings | customer/settings pages | user status, settings read/update/password | admin user/settings services -> User/Settings/AuditLog | Connected |
| Administrator management | — | create sub-admin | admin auth -> Admin/AuditLog | No rendered consumer |
| Runtime health | deployment probe | health, readiness | app/db readiness | Backend-only operational contract |

## Response-shape conversions

The frontend intentionally maps backend names to UI names where they differ:

| Backend field | Frontend field | Used by |
|---|---|---|
| `recipientName`, `postalCode` | `fullName`, `pincode` | addresses and order snapshots |
| `_id` / populated references | string `_id` and normalized objects | all entity types |
| `shippingAddress` | `address` | order pages |
| `startsAt`, `expiresAt` | `startDate`, `endDate` | admin coupon form |
| pagination `pages` | `totalPages` | lists and controls |

## Authentication boundary

The frontend does not persist access tokens (`authStore` uses an empty persistence partializer). Refresh tokens use scoped, httpOnly cookies. `authScope: 'admin'` is explicitly applied for non-`/admin/*` administrator routes such as category, product, coupon, and review moderation operations. Backend enforcement remains authoritative.

## Known mapping gaps before implementation

1. No rendered owner review edit/delete controls or administrator review moderation flow.
2. No rendered inventory-history flow, image-only upload flow, or primary-admin sub-admin workflow.
3. Catalogue and product detail silently fall back to mock/catalogue state when live APIs fail; that masks production outages.
4. Cart and wishlist mutations are optimistic but swallow API errors, potentially leaving local state divergent from the server.
