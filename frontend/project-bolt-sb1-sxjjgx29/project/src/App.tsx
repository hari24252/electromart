import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { BackToTop } from '@/components/layout/BackToTop';
import { ToastProvider } from '@/components/ui/Toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';
import { api } from '@/api/services';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useDataStore } from '@/stores/dataStore';
import { useWishlistStore } from '@/stores/wishlistStore';

const HomePage = lazy(() => import('@/pages/store/HomePage').then((module) => ({ default: module.HomePage })));
const CatalogPage = lazy(() => import('@/pages/store/CatalogPage').then((module) => ({ default: module.CatalogPage })));
const ProductDetailPage = lazy(() => import('@/pages/store/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })));
const CartPage = lazy(() => import('@/pages/store/CartPage').then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('@/pages/store/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const OrdersPage = lazy(() => import('@/pages/store/OrdersPage').then((module) => ({ default: module.OrdersPage })));
const OrderDetailPage = lazy(() => import('@/pages/store/OrderDetailPage').then((module) => ({ default: module.OrderDetailPage })));
const LoginPage = lazy(() => import('@/pages/store/LoginPage').then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('@/pages/store/SignupPage').then((module) => ({ default: module.SignupPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/store/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })));
const ProfilePage = lazy(() => import('@/pages/store/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const AddressesPage = lazy(() => import('@/pages/store/AddressesPage').then((module) => ({ default: module.AddressesPage })));
const WishlistPage = lazy(() => import('@/pages/store/WishlistPage').then((module) => ({ default: module.WishlistPage })));
const NotFoundPage = lazy(() => import('@/pages/store/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage })));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage').then((module) => ({ default: module.AdminProductsPage })));
const ProductFormPage = lazy(() => import('@/pages/admin/ProductFormPage').then((module) => ({ default: module.ProductFormPage })));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage').then((module) => ({ default: module.AdminCategoriesPage })));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage').then((module) => ({ default: module.AdminOrdersPage })));
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage').then((module) => ({ default: module.AdminOrderDetailPage })));
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminCouponsPage').then((module) => ({ default: module.AdminCouponsPage })));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage').then((module) => ({ default: module.AdminCustomersPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then((module) => ({ default: module.AdminSettingsPage })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] brutal-border bg-accent-400 px-4 py-2 text-sm font-bold">Skip to main content</a>
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
      <Footer />
      <CartDrawer />
      <BackToTop />
    </div>
  );
}

function StoreRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
      <Route path="/catalog" element={<StorefrontLayout><CatalogPage /></StorefrontLayout>} />
      <Route path="/products" element={<StorefrontLayout><CatalogPage /></StorefrontLayout>} />
      <Route path="/product/:slug" element={<StorefrontLayout><ProductDetailPage /></StorefrontLayout>} />
      <Route path="/cart" element={<StorefrontLayout><CartPage /></StorefrontLayout>} />
      <Route path="/checkout" element={<ProtectedRoute><StorefrontLayout><CheckoutPage /></StorefrontLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><StorefrontLayout><OrdersPage /></StorefrontLayout></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><StorefrontLayout><OrderDetailPage /></StorefrontLayout></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><StorefrontLayout><WishlistPage /></StorefrontLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><StorefrontLayout><ProfilePage /></StorefrontLayout></ProtectedRoute>} />
      <Route path="/addresses" element={<ProtectedRoute><StorefrontLayout><AddressesPage /></StorefrontLayout></ProtectedRoute>} />
      <Route path="/login" element={<StorefrontLayout><LoginPage /></StorefrontLayout>} />
      <Route path="/signup" element={<StorefrontLayout><SignupPage /></StorefrontLayout>} />
      <Route path="/forgot-password" element={<StorefrontLayout><ForgotPasswordPage /></StorefrontLayout>} />
      <Route path="/reset-password" element={<StorefrontLayout><ForgotPasswordPage /></StorefrontLayout>} />
      <Route path="*" element={<StorefrontLayout><NotFoundPage /></StorefrontLayout>} />
    </Routes>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}

function AppBootstrap() {
  useEffect(() => {
    void useDataStore.getState().loadCatalogue();
    let active = true;
    void Promise.allSettled([
      api.auth.me({ suppressAuthRedirect: true })
        .then(async (user) => {
          if (!active) return;
          useAuthStore.getState().setUserSession(user, useAuthStore.getState().accessToken ?? '');
          await Promise.all([useCartStore.getState().hydrate(), useWishlistStore.getState().hydrate()]);
        }),
      api.adminAuth.me({ suppressAuthRedirect: true })
        .then((admin) => {
          if (active) useAuthStore.getState().setAdminSession(admin, useAuthStore.getState().adminAccessToken ?? '');
        }),
    ]).finally(() => {
      if (active) useAuthStore.getState().markSessionReady();
    });
    return () => { active = false; };
  }, []);
  return null;
}

function RouteFallback() {
  return <div className="grid min-h-[45vh] place-items-center text-sm font-bold uppercase text-ink-400">Loading Electromart…</div>;
}

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ToastProvider>
            <AppBootstrap />
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/*" element={<StoreRoutes />} />
                <Route path="/admin/*" element={<AdminRoutes />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
