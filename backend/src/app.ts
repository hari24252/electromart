import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { isDatabaseReady } from './config/db.js';
import { logger } from './config/logger.js';
import { openapi } from './docs/openapi.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { addressRouter } from './modules/address/address.routes.js';
import { adminAuthRouter } from './modules/admin-auth/adminAuth.routes.js';
import { adminDashboardRouter } from './modules/admin-dashboard/adminDashboard.routes.js';
import { adminSettingsRouter } from './modules/admin-settings/adminSettings.routes.js';
import { adminUsersRouter } from './modules/admin-users/adminUsers.routes.js';
import { cartRouter } from './modules/cart/cart.routes.js';
import { categoryRouter } from './modules/category/category.routes.js';
import { couponRouter } from './modules/coupon/coupon.routes.js';
import { orderRouter } from './modules/order/order.routes.js';
import { newsletterRouter } from './modules/newsletter/newsletter.routes.js';
import { adminProductRouter, productRouter } from './modules/product/product.routes.js';
import { reviewRouter } from './modules/review/review.routes.js';
import { userAuthRouter } from './modules/user-auth/userAuth.routes.js';
import { wishlistRouter } from './modules/wishlist/wishlist.routes.js';
import { success } from './utils/apiResponse.js';

export const app = express();
app.set('trust proxy', env.NODE_ENV === 'production' ? 1 : false);
app.disable('x-powered-by');
app.use(pinoHttp({ logger }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads'), { maxAge: env.NODE_ENV === 'production' ? '30d' : 0, immutable: env.NODE_ENV === 'production' }));

const apiRouter = express.Router();
apiRouter.get('/health', (_req, res) => success(res, { status: 'healthy', timestamp: new Date().toISOString() }));
apiRouter.get('/ready', (_req, res) => {
  const ready = isDatabaseReady();
  return success(res, { status: ready ? 'ready' : 'not_ready', database: ready ? 'connected' : 'disconnected' }, ready ? 'Service ready' : 'Service is not ready', ready ? 200 : 503);
});
apiRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
apiRouter.use('/auth', userAuthRouter);
apiRouter.use('/admin/auth', adminAuthRouter);
apiRouter.use('/admin/products', adminProductRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/newsletter', newsletterRouter);
apiRouter.use('/coupons', couponRouter);
apiRouter.use('/wishlist', wishlistRouter);
apiRouter.use('/addresses', addressRouter);
apiRouter.use('/admin/dashboard', adminDashboardRouter);
apiRouter.use('/admin/settings', adminSettingsRouter);
apiRouter.use('/admin/users', adminUsersRouter);

// /api remains the published storefront contract. /api/v1 is the explicit, forward-compatible equivalent.
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
