export type ID = string;

export type ProductStatus = 'active' | 'draft' | 'out-of-stock' | 'archived';
export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Category {
  _id: ID;
  name: string;
  slug: string;
  parentCategory: ID | null;
  image?: string;
  subCategories?: Category[];
  productCount?: number;
  children?: Category[];
}

export interface Specification {
  group: string;
  key: string;
  value: string;
}

export interface Warranty {
  duration: string;
  type: string;
  details?: string;
}

export interface Product {
  _id: ID;
  name: string;
  slug: string;
  brand: string;
  sku: string;
  category: ID | Category;
  subCategories: ID[];
  price: number;
  discountPrice?: number | null;
  stock: number;
  images: string[];
  thumbnail?: string;
  shortDescription: string;
  longDescription: string;
  specifications: Specification[];
  whatsInTheBox: string[];
  warranty: Warranty;
  termsAndConditions?: string;
  status: ProductStatus;
  isFeatured: boolean;
  ratingsAvg?: number;
  ratingsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: ID;
  name: string;
  slug: string;
  price: number;
  priceAtAdd: number;
  image: string;
  quantity: number;
  stock: number;
  maxStock: number;
  priceChanged?: boolean;
  outOfStock?: boolean;
}

export interface Cart {
  items: CartItem[];
  itemsTotal: number;
  discountTotal: number;
  grandTotal: number;
  totalItems: number;
  warnings: string[];
}

export interface Address {
  _id: ID;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault: boolean;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderItem {
  productId: ID;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  sku: string;
}

export interface Order {
  _id: ID;
  orderNumber: string;
  user: ID;
  items: OrderItem[];
  address: Address;
  itemsTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: 'COD';
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: ID;
  product: ID;
  user: ID;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: ID;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minCartValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
}

export interface ProductDraft {
  name: string;
  brand: string;
  sku: string;
  category: string;
  subCategories: string[];
  price: number;
  discountPrice?: number;
  stock: number;
  shortDescription: string;
  longDescription: string;
  specifications: Specification[];
  whatsInTheBox: string[];
  warranty: Warranty;
  termsAndConditions?: string;
  status: Exclude<ProductStatus, 'archived'>;
  isFeatured: boolean;
}

export interface CouponDraft {
  code: string;
  type: Coupon['type'];
  value: number;
  minCartValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt: string;
  isActive: boolean;
}

export interface User {
  _id: ID;
  name: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  role: 'user';
  addresses: Address[];
  wishlist: ID[];
  createdAt: string;
}

export interface Admin {
  _id: ID;
  name: string;
  email: string;
  role: 'admin' | 'sub-admin';
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  lowStockThreshold: number;
  freeShippingMin: number;
  notifications: {
    newOrders: boolean;
    lowStock: boolean;
    newUsers: boolean;
    reviews: boolean;
  };
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
}

export interface RevenueChartPoint {
  date: string;
  total: number;
}

export interface TopProduct {
  productId: ID;
  name: string;
  image: string;
  quantitySold: number;
  revenue: number;
}

export interface LowStockProduct {
  _id: ID;
  name: string;
  sku: string;
  stock: number;
  image: string;
}

export interface RecentOrder {
  _id: ID;
  orderNumber: string;
  customerName: string;
  grandTotal: number;
  status: OrderStatus;
  createdAt: string;
}

export interface InventoryLog {
  _id: ID;
  product: ID;
  change: number;
  reason: string;
  reference?: string;
  timestamp: string;
}

export interface AdminUser {
  _id: ID;
  name: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  orderCount?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  subCategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
