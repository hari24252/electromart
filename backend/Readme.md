MERN E-Commerce — Complete Backend Architecture

Scope: College-project e-commerce platform, 50+ categories, 1000+ products, COD-only checkout, local image storage, separate User and Admin authentication systems.

1. High-Level Architecture

Pattern: Modular Monolith — one Express server, internally split into independent modules, each following a strict layered flow:

Route → Middleware Chain → Controller → Service → Repository → Model (MongoDB)
Layer	Responsibility	Never does
Route	Declares the endpoint + which middlewares run, in order	Business logic
Middleware	Auth checks, validation, file handling, rate limiting	Talking to the DB directly
Controller	Reads req, calls the right service method, shapes res	Business rules, DB queries
Service	All business logic, decisions, calculations	Direct Mongoose queries
Repository	All direct Mongoose/DB queries, nothing else	Business rules
Model	Mongoose schema definition, field-level validation	Logic beyond schema constraints

Why this matters at your scale: with 12+ modules and an Amazon-style product schema, logic will sprawl fast if controllers directly query MongoDB. Keeping repository as the only place that touches the DB means you can change a query, add caching, or swap logic without touching controllers.

2. Folder Structure
server/
├── public/
│   └── uploads/
│       └── products/            (locally stored product images)
├── src/
│   ├── modules/
│   │   ├── user-auth/
│   │   │   ├── userAuth.routes.js
│   │   │   ├── userAuth.controller.js
│   │   │   ├── userAuth.service.js
│   │   │   ├── userAuth.repository.js
│   │   │   └── userAuth.validation.js
│   │   ├── admin-auth/
│   │   │   ├── adminAuth.routes.js
│   │   │   ├── adminAuth.controller.js
│   │   │   ├── adminAuth.service.js
│   │   │   ├── adminAuth.repository.js
│   │   │   └── adminAuth.validation.js
│   │   ├── category/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── order/
│   │   ├── review/
│   │   ├── coupon/
│   │   ├── wishlist/
│   │   ├── address/
│   │   └── admin-dashboard/
│   ├── models/
│   │   ├── user.model.js
│   │   ├── admin.model.js
│   │   ├── otp.model.js
│   │   ├── category.model.js
│   │   ├── product.model.js
│   │   ├── cart.model.js
│   │   ├── order.model.js
│   │   ├── review.model.js
│   │   └── coupon.model.js
│   ├── middlewares/
│   │   ├── authenticateUser.js
│   │   ├── authenticateAdmin.js
│   │   ├── validateRequest.js
│   │   ├── errorHandler.js
│   │   ├── notFoundHandler.js
│   │   ├── asyncWrapper.js
│   │   ├── rateLimiter.js
│   │   ├── fileUpload.js
│   │   └── requestLogger.js
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── mail.js
│   ├── utils/
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   ├── generateSlug.js
│   │   ├── generateOtp.js
│   │   └── tokenUtils.js
│   ├── app.js
│   └── server.js
└── .env
3. Middleware Layer (applied across modules)
Middleware	Purpose	Where used
authenticateUser	Verifies user JWT, attaches req.user	Cart, Order (user), Review (write), Wishlist, Address
authenticateAdmin	Verifies admin JWT, attaches req.admin; completely separate token/secret from user auth	All admin-only routes
validateRequest(schema)	Validates req.body/req.query/req.params against a schema before controller runs	All write endpoints
errorHandler	Global — catches every thrown/passed error, returns uniform JSON error shape	App-level, registered last
notFoundHandler	Catches unmatched routes	App-level
asyncWrapper	Wraps async controllers so errors auto-forward to errorHandler	Every controller
rateLimiter	Caps requests per IP/time window	Auth routes, OTP-send routes
fileUpload (Multer)	Parses multipart form-data, validates file type/size, saves to public/uploads/products/	Product create/update, image routes
requestLogger	Logs method, path, status, response time	App-level, dev/demo debugging
4. Module A — User Authentication (/api/auth)

Public self-service. No admin involvement.

Method	Route	Access	Middleware chain	Purpose
POST	/signup	Public	rateLimiter → validateRequest → asyncWrapper	Create unverified user account
POST	/send-otp	Public	rateLimiter → validateRequest	Send OTP for signup/login/reset
POST	/verify-otp	Public	validateRequest	Verify OTP, activate account or complete login
POST	/login	Public	rateLimiter → validateRequest	Step 1: verify email/phone + password
POST	/verify-login-otp	Public	validateRequest	Step 2: verify OTP, issue tokens
POST	/forgot-password	Public	rateLimiter	Trigger reset OTP
POST	/reset-password	Public	validateRequest	Set new password after OTP verified
POST	/refresh-token	Public (cookie-based)	none	Issue new access token from refresh token
POST	/logout	Private	authenticateUser	Clear refresh token/cookie

Controller responsibilities: parse request body, call service, return standardized response — no logic beyond that.

Service responsibilities:

Hash passwords with bcrypt before saving; compare on login
Generate a random OTP, store it with expiry via the OTP repository
Decide OTP purpose (signup / login / reset) and enforce correct flow order (can't verify-login-otp without a valid password check first)
Issue JWT access token (short-lived) + refresh token (long-lived, httpOnly cookie)
Enforce account must be OTP-verified before login succeeds

Repository responsibilities:

createUser, findByEmail, findByPhone, updateVerificationStatus, updatePassword
createOtp, findValidOtp(identifier, purpose), deleteOtp (though TTL index auto-expires old ones)

Data captured: name, email OR phone (at least one required, both optionally), password (hashed), verification status, role fixed to user.

5. Module B — Admin Authentication (/api/admin/auth)

No public signup. Structurally separate from user auth — different model, different token secret, different middleware.

Method	Route	Access	Middleware chain	Purpose
POST	/login	Public (admin credentials only)	rateLimiter → validateRequest	Email + password only, no OTP
POST	/create-sub-admin	Admin-only	authenticateAdmin → validateRequest	Existing admin creates another admin account
POST	/refresh-token	Public (cookie-based)	none	Refresh admin token
POST	/logout	Private	authenticateAdmin	Clear admin session

Service responsibilities: password check via bcrypt, issue admin-scoped JWT (separate secret/claims from user tokens so a user token can never be replayed against admin routes), enforce that only an already-authenticated admin can create another admin.

Repository responsibilities: findAdminByEmail, createAdmin — queries scoped to the admin collection only, never touching the user collection.

Note: First admin account is seeded directly into the database (a one-time seed script), not created through any public API.

6. Module C — Category (/api/categories)
Method	Route	Access	Middleware chain	Purpose
GET	/	Public	none	Full nested category tree (all top-level + subcategories)
GET	/:slug	Public	none	Single category with its subcategories and product count
POST	/	Admin-only	authenticateAdmin → validateRequest	Create category or subcategory (subcategory = pass parentCategory)
PUT	/:id	Admin-only	authenticateAdmin → validateRequest	Update name/image/parent
DELETE	/:id	Admin-only	authenticateAdmin	Delete — service blocks deletion if active products still reference it

Service responsibilities: build the nested tree from flat category documents, validate parent exists when creating a subcategory, block deletion if products or subcategories still reference this category (data-integrity guard).

Repository responsibilities: flat CRUD on category documents, query "all categories where parentCategory = X."

Data captured: name, slug, parent reference (null = top-level), category image.

7. Module D — Product (/api/products) — the largest module
Public routes
Method	Route	Purpose
GET	/	List products — supports ?category=&subCategory=&brand=&minPrice=&maxPrice=&search=&sort=&page=&limit=
GET	/:slug	Full product detail page data
GET	/:slug/related	Related/similar products (same category, excluding itself)
Admin-only routes
Method	Route	Middleware chain	Purpose
POST	/	authenticateAdmin → fileUpload → validateRequest	Create product — the "big form"
PUT	/:id	authenticateAdmin → fileUpload → validateRequest	Update product (any field, including replacing images)
DELETE	/:id	authenticateAdmin	Delete product (soft-delete recommended: set status instead of removing, to preserve historical order integrity)
PATCH	/:id/stock	authenticateAdmin → validateRequest	Adjust stock directly (restock)
PATCH	/:id/status	authenticateAdmin	Toggle active / draft / out-of-stock
POST	/:id/images	authenticateAdmin → fileUpload	Add/replace images on an existing product without resubmitting the whole form
Big-form field set (create/update product) — mirrors what you described (Amazon-style):
name, brand, sku
category (single, required), subCategories (multi-select array)
price, discountPrice, stock
images[] (multipart files), thumbnail
shortDescription (for listing cards)
longDescription (full detail page body, rich text)
specifications[] — array of { group, key, value } so the frontend can render grouped spec tables ("Display," "Battery," "Camera," etc.)
whatsInTheBox[] — array of strings
warranty — { duration, type, details }
termsAndConditions
status — active / draft / out-of-stock
isFeatured — boolean, for homepage highlighting

Controller responsibilities: parse multipart form fields (text fields arrive as strings even for arrays/objects — controller parses JSON-stringified fields like specifications back into objects), pass file paths (already saved by fileUpload middleware) + parsed body to the service.

Service responsibilities:

Generate a unique slug from the product name (append a counter/hash if collision)
Validate that category and every subCategories entry actually exist
Validate specifications array structure (grouped correctly)
On stock changes: atomic update (findOneAndUpdate with a stock-availability condition) so concurrent orders never oversell
Build the dynamic filter query for listing (category/brand/price-range/search/sort), used by the repository
Recalculate/trigger rating aggregate updates when reviews change (called from Review service, product service exposes the update method)

Repository responsibilities:

create, updateById, findBySlug, findWithFilters(filterObj, pagination), updateStock, updateRatingAggregate, softDeleteById

Indexes to plan for: text index on name/brand/shortDescription for search; compound index on category + price for fast filtered listing.

8. Module E — Cart (/api/cart) — fully private
Method	Route	Purpose
GET	/	Get current user's cart with populated product details
POST	/add	Add item (or increment quantity if already present)
PUT	/update	Update quantity of an existing item
DELETE	/remove/:productId	Remove single item
DELETE	/clear	Empty entire cart (used after order placement)

All routes: authenticateUser → validateRequest (where applicable).

Service responsibilities: check requested quantity against live stock before adding, recalculate cart totals on every read, compare priceAtAdd (snapshotted price) against the live product price and flag if it changed — so the frontend can warn the user before checkout.

Repository responsibilities: find-or-create the user's single cart document, push/update/pull items within it.

9. Module F — Order (/api/orders)
User routes
Method	Route	Purpose
POST	/	Place order — COD only
GET	/my-orders	List logged-in user's own orders
GET	/my-orders/:id	Single order detail + tracking timeline
PATCH	/my-orders/:id/cancel	Cancel — only allowed while status is still placed
Admin routes
Method	Route	Purpose
GET	/	All orders, filterable by status/date range
GET	/:id	Any order's full detail
PATCH	/:id/status	Update status (placed → processing → shipped → delivered), appends to statusHistory

All user routes: authenticateUser. All admin routes: authenticateAdmin.

Service responsibilities (this module carries the most business logic):

Re-validate stock for every cart item at the moment of order placement (stock may have changed since it was added to cart) — reject or partially fail gracefully if unavailable
Decrement stock atomically per item
Snapshot product name, price, image into the order document at creation time (so later product edits never retroactively change historical order records)
Apply coupon if provided: re-validate expiry/min-cart-value/usage-limit at order time (never trust a client-sent discount amount)
Calculate itemsTotal, discountTotal, grandTotal
Set paymentMethod: 'COD' unconditionally
Clear the user's cart after successful placement
On status update, push a new entry into statusHistory with timestamp
On cancellation, restore stock for the cancelled items

Repository responsibilities: create, findByUser, findById, findAll(filters), updateStatus, pushStatusHistory.

10. Module G — Review (/api/reviews)
Method	Route	Access	Purpose
GET	/product/:productId	Public	All reviews for a product
POST	/product/:productId	Private (user)	Post a review
PUT	/:id	Private (owner only)	Edit own review
DELETE	/:id	Private (owner) / Admin	Delete own review, or admin moderation delete

Service responsibilities:

Before allowing a post, check whether this user has any delivered order containing this product → sets isVerifiedPurchase
Block duplicate review (enforced also at schema level via unique compound index on product + user)
After any create/update/delete, recompute the product's ratingsAvg/ratingsCount (calls into Product service/repository)

Repository responsibilities: CRUD on review documents, aggregation query to compute average rating + count for a given product.

11. Module H — Coupon (/api/coupons)
Method	Route	Access	Purpose
POST	/apply	Private (user)	Validates a code against current cart, returns discount amount (doesn't persist usage yet)
GET	/	Admin-only	List all coupons
POST	/	Admin-only	Create coupon
PUT	/:id	Admin-only	Update coupon
DELETE	/:id	Admin-only	Deactivate/delete coupon

Service responsibilities: validate expiry date, minimum cart value, remaining usage count, coupon active status; calculate discount amount (percentage or flat) without mutating usage — actual usedCount increment happens only inside Order service upon successful order placement, to avoid counting abandoned checkouts.

Repository responsibilities: findByCode, CRUD, incrementUsage.

12. Module I — Wishlist (/api/wishlist) — fully private
Method	Route	Purpose
GET	/	Get wishlist with populated product data
POST	/add/:productId	Add product
DELETE	/remove/:productId	Remove product

Simple module — service just checks the product exists before adding; repository pushes/pulls from the user's wishlist array.

13. Module J — Address (/api/addresses) — fully private
Method	Route	Purpose
GET	/	List saved addresses
POST	/	Add new address
PUT	/:id	Edit address
DELETE	/:id	Remove address
PATCH	/:id/set-default	Mark one address as default

Service responsibilities: when setting a new default, unset the previous default (only one default allowed at a time).

Repository responsibilities: manage the addresses sub-array inside the user document directly.

14. Module K — Admin Dashboard (/api/admin/dashboard)
Method	Route	Purpose
GET	/stats	Summary cards: total revenue, total orders, total users, total products
GET	/revenue-chart	Revenue grouped by day/week/month (aggregation pipeline)
GET	/top-products	Best-selling products by quantity sold
GET	/low-stock	Products below a stock threshold
GET	/recent-orders	Latest N orders for a quick-glance table

All routes: authenticateAdmin.

Service responsibilities: orchestrate which aggregation queries to run per endpoint, combine/shape results for the frontend (e.g., chart-ready {date, total} arrays).

Repository responsibilities: the raw MongoDB aggregation pipelines themselves — grouping orders by date, summing revenue, grouping order items by product to find top sellers, querying products where stock <= threshold.

15. Image Handling — Full Route + Flow Recap
Admin submits product form as multipart/form-data (text fields + image files together) to POST /api/products or PUT /api/products/:id
Optional dedicated route POST /api/products/:id/images for adding/replacing images independently after creation
fileUpload (Multer) middleware intercepts, validates type/size, saves files to server/public/uploads/products/, generates unique filenames
Only the resulting file paths (e.g. /uploads/products/abc123.jpg) are saved into the product's images[] field in MongoDB — never the binary data itself
server/public/uploads is exposed via Express static file serving, so any saved image becomes a directly loadable URL with no extra route or auth needed to view it
Frontend receives these paths in the product API response and renders them directly in <img> tags, prefixed with the API base URL if needed
16. Cross-Cutting Infrastructure Decisions
Concern	Decision
Password hashing	bcrypt
Auth tokens	JWT — access (short) + refresh (long, httpOnly cookie) — separate secrets for user vs admin
OTP delivery	Email via free SMTP (Nodemailer); phone OTP simulated/logged for demo purposes
Validation	Schema-based validation on every write endpoint (Joi or Zod)
Error handling	One centralized error middleware, consistent JSON error shape everywhere
Logging	Basic request logger for dev/demo debugging
Search	MongoDB text index + compound indexes — no external search engine
Image storage	Local disk via Multer, served statically — no cloud storage
Rate limiting	Applied to auth and OTP-related routes only
Payments	None — COD only, paymentMethod field fixed
17. Complete Endpoint Count Summary
Module	Public routes	User-private routes	Admin-only routes
User Auth	6	1 (logout)	0
Admin Auth	1 (login)	0	3
Category	2	0	3
Product	3	0	6
Cart	0	5	0
Order	0	4	3
Review	1	3	(moderation shared)
Coupon	0	1	4
Wishlist	0	3	0
Address	0	5	0
Admin Dashboard	0	0	5

Total: ~55 endpoints across a fully modular, layered backend — this is the complete surface your React frontend (storefront + admin dashboard) will consume.






1. Complete backend technology stack
Area	Technology / Library	Purpose
Runtime	Node.js	JavaScript/TypeScript server runtime
Language	TypeScript	Type safety and maintainability
Framework	Express.js 5	HTTP/API server
Database	MongoDB	Primary database
ODM	Mongoose	MongoDB schemas, models, queries
Authentication	JWT	Access/refresh authentication
Password	bcryptjs	Password hashing
Validation	Zod	Request/environment validation
Cookies	cookie-parser	Refresh-token cookies
Security	Helmet	HTTP security headers
CORS	cors	Frontend/backend origin control
Rate limiting	express-rate-limit	Brute-force/API abuse protection
Uploads	Multer	Multipart image uploads
Image storage	Cloudinary	Product-image cloud storage
Email	Nodemailer	OTP/email delivery
Logging	Pino + pino-http	Structured application/request logs
Cache	Redis	Caching and temporary data
Jobs	BullMQ	Background jobs/queues
Testing	Vitest	Unit/integration testing
API testing	Supertest	HTTP endpoint testing
Dev runner	tsx	Run TypeScript directly
Build	TypeScript compiler	Compile TS → JS
Git	Git/GitHub	Version control
Containers	Docker	Reproducible deployment
API documentation	OpenAPI/Swagger	API contract/documentation