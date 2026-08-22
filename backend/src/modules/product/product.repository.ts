import type { UpdateQuery } from 'mongoose';
import { Product } from '../../models/product.model.js';
import { Category } from '../../models/category.model.js';
import { InventoryLog } from '../../models/inventoryLog.model.js';

export const productRepository = {
  create: (data: Record<string, unknown>) => Product.create(data),
  findBySlug: (slug: string, includeInactive = false) => Product.findOne({ slug, deletedAt: null, ...(includeInactive ? {} : { status: 'active' }) }).populate('category subCategories').lean(),
  findById: (id: string) => Product.findOne({ _id: id, deletedAt: null }),
  findByIdLean: (id: string) => Product.findOne({ _id: id, deletedAt: null }).lean(),
  findBySku: (sku: string) => Product.findOne({ sku: sku.toUpperCase() }),
  findWithFilters: async (filter: Record<string, unknown>, page: number, limit: number, sort: Record<string, 1 | -1>) => {
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate('category', 'name slug').lean(),
      Product.countDocuments(filter),
    ]);
    return { items, total };
  },
  update: (id: string, data: UpdateQuery<unknown>) => Product.findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true, runValidators: true }),
  softDelete: (id: string) => Product.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date(), status: 'archived' }, { new: true }),
  findCategoryById: (id: string) => Category.findById(id),
  findCategoryBySlug: (slug: string) => Category.findOne({ slug }),
  updateRatingAggregate: (id: string, ratingsAvg: number, ratingsCount: number) => Product.findByIdAndUpdate(id, { ratingsAvg, ratingsCount }),
  adjustStock: (id: string, change: number) => Product.findOneAndUpdate(
    { _id: id, deletedAt: null, stock: { $gte: Math.max(0, -change) } },
    { $inc: { stock: change } },
    { new: true },
  ),
  reserveStock: (id: string, quantity: number) => Product.findOneAndUpdate({ _id: id, deletedAt: null, status: 'active', stock: { $gte: quantity } }, { $inc: { stock: -quantity, soldCount: quantity } }, { new: true }),
  restoreStock: (id: string, quantity: number) => Product.findByIdAndUpdate(id, { $inc: { stock: quantity, soldCount: -quantity } }, { new: true }),
  createInventoryLog: (data: Record<string, unknown>) => InventoryLog.create(data),
  inventoryHistory: (productId: string, limit: number) => InventoryLog.find({ product: productId }).sort({ createdAt: -1 }).limit(limit).populate('actor', 'name email').lean(),
};
