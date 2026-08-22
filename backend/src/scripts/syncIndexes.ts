import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { logger } from '../config/logger.js';
import { Admin } from '../models/admin.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { Cart } from '../models/cart.model.js';
import { Category } from '../models/category.model.js';
import { Coupon } from '../models/coupon.model.js';
import { InventoryLog } from '../models/inventoryLog.model.js';
import { Order } from '../models/order.model.js';
import { Otp } from '../models/otp.model.js';
import { Product } from '../models/product.model.js';
import { Review } from '../models/review.model.js';
import { User } from '../models/user.model.js';

const models = [Admin, AuditLog, Cart, Category, Coupon, InventoryLog, Order, Otp, Product, Review, User];

async function main(): Promise<void> {
  await connectDatabase();
  await Promise.all(models.map((model) => model.syncIndexes()));
  logger.info({ collections: models.map((model) => model.collection.name) }, 'MongoDB indexes synchronized');
  await disconnectDatabase();
}

void main().catch(async (error: unknown) => {
  logger.error({ err: error }, 'MongoDB index synchronization failed');
  await disconnectDatabase();
  process.exitCode = 1;
});
