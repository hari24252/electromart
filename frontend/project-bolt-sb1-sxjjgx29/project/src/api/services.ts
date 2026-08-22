import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { resolveMediaUrl } from '@/lib/media';
import type {
  Address,
  Admin,
  AdminUser,
  Cart,
  CartItem,
  Category,
  Coupon,
  CouponDraft,
  DashboardStats,
  InventoryLog,
  LowStockProduct,
  Order,
  OrderStatus,
  Paginated,
  Product,
  ProductDraft,
  ProductFilters,
  RecentOrder,
  Review,
  RevenueChartPoint,
  StoreSettings,
  TopProduct,
  User,
} from '@/types';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

type UnknownRecord = Record<string, unknown>;
type ScopedRequestConfig = AxiosRequestConfig & { authScope?: 'user' | 'admin'; suppressAuthRedirect?: boolean };
type ProductUpdateDraft = Omit<Partial<ProductDraft>, 'discountPrice'> & { discountPrice?: number | null };

const orderStatuses: OrderStatus[] = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
const productStatuses = ['active', 'draft', 'out-of-stock', 'archived'] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function listValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function idValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (isRecord(value)) return stringValue(value._id, stringValue(value.id));
  return '';
}

function toParams(filters: object): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters as Record<string, string | number | boolean | undefined>).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params;
}

async function request<T>(config: ScopedRequestConfig, normalize: (value: unknown) => T): Promise<T> {
  const response = await apiClient.request<ApiEnvelope<unknown>>(config);
  return normalize(response.data.data);
}

function normalizeAddress(value: unknown): Address {
  const address = isRecord(value) ? value : {};
  return {
    _id: idValue(address._id) || idValue(address.id),
    label: stringValue(address.label, 'Home'),
    fullName: stringValue(address.recipientName, stringValue(address.fullName)),
    phone: stringValue(address.phone),
    line1: stringValue(address.line1),
    line2: stringValue(address.line2) || undefined,
    city: stringValue(address.city),
    state: stringValue(address.state),
    pincode: stringValue(address.postalCode, stringValue(address.pincode)),
    country: stringValue(address.country, 'India'),
    isDefault: booleanValue(address.isDefault),
  };
}

function normalizeCategory(value: unknown): Category {
  const category = isRecord(value) ? value : {};
  return {
    _id: idValue(category._id) || idValue(category.id),
    name: stringValue(category.name),
    slug: stringValue(category.slug),
    parentCategory: idValue(category.parentCategory) || null,
    image: stringValue(category.image) ? resolveMediaUrl(stringValue(category.image), stringValue(category.name)) : undefined,
    productCount: numberValue(category.productCount) || undefined,
    children: listValue(category.children ?? category.subCategories ?? category.subcategories).map(normalizeCategory),
  };
}

function normalizeProduct(value: unknown): Product {
  const product = isRecord(value) ? value : {};
  const status = stringValue(product.status, 'active');
  return {
    _id: idValue(product._id) || idValue(product.id),
    name: stringValue(product.name),
    slug: stringValue(product.slug),
    brand: stringValue(product.brand),
    sku: stringValue(product.sku),
    category: typeof product.category === 'string' ? product.category : normalizeCategory(product.category),
    subCategories: listValue(product.subCategories).map(idValue).filter(Boolean),
    price: numberValue(product.price),
    discountPrice: typeof product.discountPrice === 'number' ? product.discountPrice : null,
    stock: numberValue(product.stock),
    images: listValue(product.images).map((image) => resolveMediaUrl(stringValue(image), stringValue(product.name))).filter(Boolean),
    thumbnail: stringValue(product.thumbnail) ? resolveMediaUrl(stringValue(product.thumbnail), stringValue(product.name)) : undefined,
    shortDescription: stringValue(product.shortDescription),
    longDescription: stringValue(product.longDescription),
    specifications: listValue(product.specifications).flatMap((item) => {
      if (!isRecord(item)) return [];
      const group = stringValue(item.group);
      const key = stringValue(item.key);
      const specValue = stringValue(item.value);
      return group && key && specValue ? [{ group, key, value: specValue }] : [];
    }),
    whatsInTheBox: listValue(product.whatsInTheBox).map((item) => stringValue(item)).filter(Boolean),
    warranty: isRecord(product.warranty) ? {
      duration: stringValue(product.warranty.duration),
      type: stringValue(product.warranty.type),
      details: stringValue(product.warranty.details) || undefined,
    } : { duration: '', type: '' },
    termsAndConditions: stringValue(product.termsAndConditions) || undefined,
    status: productStatuses.includes(status as (typeof productStatuses)[number]) ? status as Product['status'] : 'active',
    isFeatured: booleanValue(product.isFeatured),
    ratingsAvg: numberValue(product.ratingsAvg),
    ratingsCount: numberValue(product.ratingsCount),
    createdAt: stringValue(product.createdAt, new Date().toISOString()),
    updatedAt: stringValue(product.updatedAt, new Date().toISOString()),
  };
}

function normalizeUser(value: unknown): User {
  const user = isRecord(value) ? value : {};
  return {
    _id: idValue(user._id) || idValue(user.id),
    name: stringValue(user.name),
    email: stringValue(user.email) || undefined,
    phone: stringValue(user.phone) || undefined,
    isVerified: booleanValue(user.isVerified),
    role: 'user',
    addresses: listValue(user.addresses).map(normalizeAddress),
    wishlist: listValue(user.wishlist).map(idValue).filter(Boolean),
    createdAt: stringValue(user.createdAt, new Date().toISOString()),
  };
}

function normalizeAdmin(value: unknown): Admin {
  const admin = isRecord(value) ? value : {};
  return {
    _id: idValue(admin._id) || idValue(admin.id),
    name: stringValue(admin.name),
    email: stringValue(admin.email),
    role: admin.role === 'sub-admin' ? 'sub-admin' : 'admin',
    createdAt: stringValue(admin.createdAt, new Date().toISOString()),
  };
}

function normalizeCart(value: unknown): Cart {
  const cart = isRecord(value) ? value : {};
  const items: CartItem[] = listValue(cart.items).flatMap((item) => {
    if (!isRecord(item) || !isRecord(item.product)) return [];
    const product = normalizeProduct(item.product);
    const currentPrice = numberValue(item.currentPrice, product.discountPrice ?? product.price);
    return [{
      productId: product._id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      priceAtAdd: numberValue(item.priceAtAdd, currentPrice),
      image: product.thumbnail ?? product.images[0] ?? resolveMediaUrl(undefined, product.name),
      quantity: numberValue(item.quantity, 1),
      stock: product.stock,
      maxStock: product.stock,
      priceChanged: booleanValue(item.priceChanged),
      outOfStock: !booleanValue(item.available, true),
    }];
  });
  const itemsTotal = numberValue(cart.itemsTotal, items.reduce((total, item) => total + item.price * item.quantity, 0));
  return {
    items,
    itemsTotal,
    discountTotal: 0,
    grandTotal: itemsTotal,
    totalItems: numberValue(cart.quantityTotal, items.reduce((total, item) => total + item.quantity, 0)),
    warnings: [
      ...(booleanValue(cart.hasPriceChanges) ? ['Some product prices have changed.'] : []),
      ...(booleanValue(cart.hasAvailabilityChanges) ? ['Some product availability has changed.'] : []),
    ],
  };
}

function normalizeOrder(value: unknown): Order {
  const order = isRecord(value) ? value : {};
  const status = stringValue(order.status, 'placed');
  return {
    _id: idValue(order._id) || idValue(order.id),
    orderNumber: stringValue(order.orderNumber),
    user: idValue(order.user),
    items: listValue(order.items).flatMap((item) => {
      if (!isRecord(item)) return [];
      return [{
        productId: idValue(item.productId) || idValue(item.product),
        name: stringValue(item.name),
        slug: stringValue(item.slug),
        price: numberValue(item.price),
        image: resolveMediaUrl(stringValue(item.image), stringValue(item.name)),
        quantity: numberValue(item.quantity, 1),
        sku: stringValue(item.sku),
      }];
    }),
    address: normalizeAddress(order.shippingAddress ?? order.address),
    itemsTotal: numberValue(order.itemsTotal),
    discountTotal: numberValue(order.discountTotal),
    grandTotal: numberValue(order.grandTotal),
    paymentMethod: 'COD',
    status: orderStatuses.includes(status as OrderStatus) ? status as OrderStatus : 'placed',
    statusHistory: listValue(order.statusHistory).flatMap((entry) => {
      if (!isRecord(entry)) return [];
      const historyStatus = stringValue(entry.status);
      if (!orderStatuses.includes(historyStatus as OrderStatus)) return [];
      return [{ status: historyStatus as OrderStatus, timestamp: stringValue(entry.changedAt, stringValue(entry.timestamp)), note: stringValue(entry.note) || undefined }];
    }),
    couponCode: isRecord(order.coupon) ? stringValue(order.coupon.code) || undefined : stringValue(order.couponCode) || undefined,
    createdAt: stringValue(order.createdAt, new Date().toISOString()),
    updatedAt: stringValue(order.updatedAt, new Date().toISOString()),
  };
}

function normalizeReview(value: unknown): Review {
  const review = isRecord(value) ? value : {};
  const user = isRecord(review.user) ? review.user : {};
  return {
    _id: idValue(review._id) || idValue(review.id),
    product: idValue(review.product),
    user: idValue(review.user),
    userName: stringValue(user.name, stringValue(review.userName, 'Electromart customer')),
    rating: numberValue(review.rating),
    title: stringValue(review.title) || undefined,
    comment: stringValue(review.comment),
    isVerifiedPurchase: booleanValue(review.isVerifiedPurchase),
    createdAt: stringValue(review.createdAt, new Date().toISOString()),
    updatedAt: stringValue(review.updatedAt, new Date().toISOString()),
  };
}

function normalizeCoupon(value: unknown): Coupon {
  const coupon = isRecord(value) ? value : {};
  return {
    _id: idValue(coupon._id) || idValue(coupon.id),
    code: stringValue(coupon.code),
    type: coupon.type === 'flat' ? 'flat' : 'percentage',
    value: numberValue(coupon.value),
    minCartValue: numberValue(coupon.minCartValue),
    maxDiscount: typeof coupon.maxDiscount === 'number' ? coupon.maxDiscount : undefined,
    startDate: stringValue(coupon.startsAt, stringValue(coupon.startDate)),
    endDate: stringValue(coupon.expiresAt, stringValue(coupon.endDate)),
    usageLimit: numberValue(coupon.usageLimit),
    usedCount: numberValue(coupon.usedCount),
    isActive: booleanValue(coupon.isActive),
  };
}

function normalizeStoreSettings(value: unknown): StoreSettings {
  const settings = isRecord(value) ? value : {};
  const notifications = isRecord(settings.notifications) ? settings.notifications : {};
  return {
    storeName: stringValue(settings.storeName, 'ElectroMart'),
    supportEmail: stringValue(settings.supportEmail, 'support@electromart.com'),
    supportPhone: stringValue(settings.supportPhone, '1800-123-4567'),
    lowStockThreshold: numberValue(settings.lowStockThreshold, 10),
    freeShippingMin: numberValue(settings.freeShippingMin, 999),
    notifications: {
      newOrders: booleanValue(notifications.newOrders, true),
      lowStock: booleanValue(notifications.lowStock, true),
      newUsers: booleanValue(notifications.newUsers, false),
      reviews: booleanValue(notifications.reviews, true),
    },
  };
}

function normalizePage<T>(value: unknown, normalize: (item: unknown) => T): Paginated<T> {
  const page = isRecord(value) ? value : {};
  const pagination = isRecord(page.pagination) ? page.pagination : {};
  return {
    items: listValue(page.items).map(normalize),
    page: numberValue(pagination.page, 1),
    limit: numberValue(pagination.limit, 20),
    total: numberValue(pagination.total),
    totalPages: numberValue(pagination.pages, 1),
  };
}

function productFormData(draft: ProductDraft | ProductUpdateDraft, files: File[]): FormData {
  const data = new FormData();
  if (draft.name !== undefined) data.append('name', draft.name);
  if (draft.brand !== undefined) data.append('brand', draft.brand);
  if (draft.sku !== undefined) data.append('sku', draft.sku);
  if (draft.category !== undefined) data.append('category', draft.category);
  if (draft.subCategories !== undefined) data.append('subCategories', JSON.stringify(draft.subCategories));
  if (draft.price !== undefined) data.append('price', String(draft.price));
  if (draft.discountPrice !== undefined) data.append('discountPrice', draft.discountPrice === null ? 'null' : String(draft.discountPrice));
  if (draft.stock !== undefined) data.append('stock', String(draft.stock));
  if (draft.shortDescription !== undefined) data.append('shortDescription', draft.shortDescription);
  if (draft.longDescription !== undefined) data.append('longDescription', draft.longDescription);
  if (draft.specifications !== undefined) data.append('specifications', JSON.stringify(draft.specifications));
  if (draft.whatsInTheBox !== undefined) data.append('whatsInTheBox', JSON.stringify(draft.whatsInTheBox));
  if (draft.warranty !== undefined) data.append('warranty', JSON.stringify(draft.warranty));
  if (draft.termsAndConditions) data.append('termsAndConditions', draft.termsAndConditions);
  if (draft.status !== undefined) data.append('status', draft.status);
  if (draft.isFeatured !== undefined) data.append('isFeatured', String(draft.isFeatured));
  files.forEach((file) => data.append('images', file));
  return data;
}

export const api = {
  auth: {
    signup: (payload: { name: string; email?: string; phone?: string; password: string }) => request({ method: 'POST', url: '/auth/signup', data: payload }, normalizeUser),
    sendOtp: (identifier: string, purpose: 'signup' | 'login' | 'reset') => request({ method: 'POST', url: '/auth/send-otp', data: { identifier, purpose } }, () => undefined),
    verifyOtp: (identifier: string, purpose: 'signup' | 'login' | 'reset', otp: string) => request({ method: 'POST', url: '/auth/verify-otp', data: { identifier, purpose, otp } }, (value) => value),
    login: (identifier: string, password: string) => request({ method: 'POST', url: '/auth/login', data: { identifier, password } }, () => undefined),
    verifyLoginOtp: (identifier: string, otp: string) => request({ method: 'POST', url: '/auth/verify-login-otp', data: { identifier, purpose: 'login', otp } }, (value) => value as { accessToken: string }),
    forgotPassword: (identifier: string) => request({ method: 'POST', url: '/auth/forgot-password', data: { identifier } }, () => undefined),
    resetPassword: (identifier: string, password: string) => request({ method: 'POST', url: '/auth/reset-password', data: { identifier, password } }, () => undefined),
    me: (options: Pick<ScopedRequestConfig, 'suppressAuthRedirect'> = {}) => request({ method: 'GET', url: '/auth/me', authScope: 'user', ...options }, normalizeUser),
    updateProfile: (name: string) => request({ method: 'PATCH', url: '/auth/me', data: { name }, authScope: 'user' }, normalizeUser),
    logout: () => request({ method: 'POST', url: '/auth/logout' }, () => undefined),
    changePassword: (currentPassword: string, newPassword: string) => request({ method: 'POST', url: '/auth/change-password', data: { currentPassword, newPassword } }, () => undefined),
  },
  adminAuth: {
    login: (email: string, password: string) => request({ method: 'POST', url: '/admin/auth/login', data: { email, password } }, (value) => value as { accessToken: string }),
    me: (options: Pick<ScopedRequestConfig, 'suppressAuthRedirect'> = {}) => request({ method: 'GET', url: '/admin/auth/me', authScope: 'admin', ...options }, normalizeAdmin),
    logout: () => request({ method: 'POST', url: '/admin/auth/logout' }, () => undefined),
    changePassword: (currentPassword: string, newPassword: string) => request({ method: 'POST', url: '/admin/auth/change-password', data: { currentPassword, newPassword }, authScope: 'admin' }, () => undefined),
  },
  catalogue: {
    categories: () => request({ method: 'GET', url: '/categories' }, (value) => listValue(value).map(normalizeCategory)),
    products: (filters: ProductFilters = {}) => request({ method: 'GET', url: `/products?${toParams(filters).toString()}` }, (value) => normalizePage(value, normalizeProduct)),
    product: (slug: string) => request({ method: 'GET', url: `/products/${slug}` }, normalizeProduct),
    related: (slug: string) => request({ method: 'GET', url: `/products/${slug}/related` }, (value) => listValue(value).map(normalizeProduct)),
  },
  cart: {
    get: () => request({ method: 'GET', url: '/cart' }, normalizeCart),
    add: (productId: string, quantity = 1) => request({ method: 'POST', url: '/cart/add', data: { productId, quantity } }, normalizeCart),
    update: (productId: string, quantity: number) => request({ method: 'PUT', url: '/cart/update', data: { productId, quantity } }, normalizeCart),
    remove: (productId: string) => request({ method: 'DELETE', url: `/cart/remove/${productId}` }, normalizeCart),
    clear: () => request({ method: 'DELETE', url: '/cart/clear' }, () => undefined),
  },
  addresses: {
    list: () => request({ method: 'GET', url: '/addresses' }, (value) => listValue(value).map(normalizeAddress)),
    create: (address: Omit<Address, '_id'>) => request({ method: 'POST', url: '/addresses', data: { ...address, recipientName: address.fullName, postalCode: address.pincode } }, normalizeAddress),
    update: (id: string, address: Partial<Omit<Address, '_id'>>) => request({ method: 'PUT', url: `/addresses/${id}`, data: { ...address, ...(address.fullName ? { recipientName: address.fullName } : {}), ...(address.pincode ? { postalCode: address.pincode } : {}) } }, normalizeAddress),
    remove: (id: string) => request({ method: 'DELETE', url: `/addresses/${id}` }, () => undefined),
    setDefault: (id: string) => request({ method: 'PATCH', url: `/addresses/${id}/set-default` }, normalizeAddress),
  },
  orders: {
    create: (addressId: string, couponCode?: string) => request({ method: 'POST', url: '/orders', data: { addressId, ...(couponCode ? { couponCode } : {}) } }, normalizeOrder),
    mine: (page = 1, limit = 20) => request({ method: 'GET', url: `/orders/my-orders?${toParams({ page, limit }).toString()}` }, (value) => normalizePage(value, normalizeOrder)),
    mineDetail: (id: string) => request({ method: 'GET', url: `/orders/my-orders/${id}` }, normalizeOrder),
    cancel: (id: string, note?: string) => request({ method: 'PATCH', url: `/orders/my-orders/${id}/cancel`, data: { ...(note ? { note } : {}) } }, normalizeOrder),
    list: (filters: { page?: number; limit?: number; status?: string } = {}) => request({ method: 'GET', url: `/orders?${toParams(filters).toString()}`, authScope: 'admin' }, (value) => normalizePage(value, normalizeOrder)),
    detail: (id: string) => request({ method: 'GET', url: `/orders/${id}`, authScope: 'admin' }, normalizeOrder),
    updateStatus: (id: string, status: 'processing' | 'shipped' | 'delivered', note?: string) => request({ method: 'PATCH', url: `/orders/${id}/status`, data: { status, ...(note ? { note } : {}) }, authScope: 'admin' }, normalizeOrder),
  },
  wishlist: {
    list: () => request({ method: 'GET', url: '/wishlist' }, (value) => listValue(value).map(normalizeProduct)),
    add: (productId: string) => request({ method: 'POST', url: `/wishlist/add/${productId}` }, (value) => listValue(value).map(normalizeProduct)),
    remove: (productId: string) => request({ method: 'DELETE', url: `/wishlist/remove/${productId}` }, () => undefined),
  },
  newsletter: {
    subscribe: (email: string) => request({ method: 'POST', url: '/newsletter/subscribe', data: { email, marketingConsent: true } }, (value) => {
      const subscriber = isRecord(value) ? value : {};
      return { email: stringValue(subscriber.email, email) };
    }),
  },
  reviews: {
    list: (productId: string) => request({ method: 'GET', url: `/reviews/product/${productId}` }, (value) => listValue(value).map(normalizeReview)),
    create: (productId: string, payload: { rating: number; title?: string; comment: string }) => request({ method: 'POST', url: `/reviews/product/${productId}`, data: payload }, normalizeReview),
    update: (id: string, payload: Partial<{ rating: number; title: string; comment: string }>) => request({ method: 'PUT', url: `/reviews/${id}`, data: payload }, normalizeReview),
    remove: (id: string) => request({ method: 'DELETE', url: `/reviews/${id}` }, () => undefined),
    moderate: (id: string, isApproved: boolean) => request({ method: 'PATCH', url: `/reviews/${id}/moderate`, data: { isApproved } }, normalizeReview),
  },
  coupons: {
    apply: (code: string) => request({ method: 'POST', url: '/coupons/apply', data: { code } }, (value) => {
      const coupon = isRecord(value) ? value : {};
      return { code: stringValue(coupon.code, code), discount: numberValue(coupon.discount) };
    }),
    list: () => request({ method: 'GET', url: '/coupons', authScope: 'admin' }, (value) => listValue(value).map(normalizeCoupon)),
    create: (draft: CouponDraft) => request({ method: 'POST', url: '/coupons', data: draft, authScope: 'admin' }, normalizeCoupon),
    update: (id: string, draft: Partial<CouponDraft>) => request({ method: 'PUT', url: `/coupons/${id}`, data: draft, authScope: 'admin' }, normalizeCoupon),
    remove: (id: string) => request({ method: 'DELETE', url: `/coupons/${id}`, authScope: 'admin' }, () => undefined),
  },
  admin: {
    dashboard: {
      stats: () => request({ method: 'GET', url: '/admin/dashboard/stats' }, (value) => value as DashboardStats),
      revenueChart: (period: 'day' | 'week' | 'month' = 'day') => request({ method: 'GET', url: `/admin/dashboard/revenue-chart?period=${period}` }, (value) => listValue(value).map((point) => {
        const record = isRecord(point) ? point : {};
        return { date: stringValue(record.date, stringValue(record._id)), total: numberValue(record.total, numberValue(record.revenue)) };
      }) as RevenueChartPoint[]),
      topProducts: () => request({ method: 'GET', url: '/admin/dashboard/top-products?limit=8' }, (value) => listValue(value) as TopProduct[]),
      lowStock: () => request({ method: 'GET', url: '/admin/dashboard/low-stock?threshold=10' }, (value) => listValue(value) as LowStockProduct[]),
      recentOrders: () => request({ method: 'GET', url: '/admin/dashboard/recent-orders?limit=8' }, (value) => listValue(value) as RecentOrder[]),
    },
    users: {
      list: (filters: { search?: string; verified?: boolean; page?: number; limit?: number } = {}) => request({ method: 'GET', url: `/admin/users?${toParams(filters).toString()}` }, (value) => normalizePage(value, (item) => item as AdminUser)),
      setStatus: (id: string, isActive: boolean) => request({ method: 'PATCH', url: `/admin/users/${id}/status`, data: { isActive } }, (value) => value as AdminUser),
    },
    settings: {
      read: () => request({ method: 'GET', url: '/admin/settings', authScope: 'admin' }, normalizeStoreSettings),
      update: (settings: StoreSettings) => request({ method: 'PUT', url: '/admin/settings', data: settings, authScope: 'admin' }, normalizeStoreSettings),
    },
    categories: {
      create: (payload: { name: string; parentCategory?: string | null; image?: string; isActive?: boolean; sortOrder?: number }) => request({ method: 'POST', url: '/categories', data: payload, authScope: 'admin' }, normalizeCategory),
      update: (id: string, payload: Partial<{ name: string; parentCategory: string | null; image: string; isActive: boolean; sortOrder: number }>) => request({ method: 'PUT', url: `/categories/${id}`, data: payload, authScope: 'admin' }, normalizeCategory),
      remove: (id: string) => request({ method: 'DELETE', url: `/categories/${id}`, authScope: 'admin' }, () => undefined),
    },
    products: {
      list: (filters: { page?: number; limit?: number; status?: Product['status']; category?: string; search?: string; sort?: string } = {}) => request({ method: 'GET', url: `/admin/products?${toParams(filters).toString()}` }, (value) => normalizePage(value, normalizeProduct)),
      create: (draft: ProductDraft, files: File[]) => request({ method: 'POST', url: '/products', data: productFormData(draft, files), headers: { 'Content-Type': 'multipart/form-data' }, authScope: 'admin' }, normalizeProduct),
      update: (id: string, draft: ProductUpdateDraft, files: File[]) => request({ method: 'PUT', url: `/products/${id}`, data: productFormData(draft, files), headers: { 'Content-Type': 'multipart/form-data' }, authScope: 'admin' }, normalizeProduct),
      archive: (id: string) => request({ method: 'DELETE', url: `/products/${id}`, authScope: 'admin' }, () => undefined),
      adjustStock: (id: string, change: number, reason: 'restock' | 'correction', reference?: string) => request({ method: 'PATCH', url: `/products/${id}/stock`, data: { change, reason, ...(reference ? { reference } : {}) }, authScope: 'admin' }, normalizeProduct),
      setStatus: (id: string, status: Product['status']) => request({ method: 'PATCH', url: `/products/${id}/status`, data: { status }, authScope: 'admin' }, normalizeProduct),
      inventoryHistory: (id: string) => request({ method: 'GET', url: `/products/${id}/inventory-history`, authScope: 'admin' }, (value) => listValue(value) as InventoryLog[]),
    },
  },
};

export { normalizeProduct };
