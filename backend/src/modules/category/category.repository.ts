import { Category } from '../../models/category.model.js';
import { Product } from '../../models/product.model.js';

export const categoryRepository = {
  findAll: () => Category.find({}).sort({ sortOrder: 1, name: 1 }).lean(),
  findBySlug: (slug: string) => Category.findOne({ slug }).lean(),
  findById: (id: string) => Category.findById(id),
  findBySlugOrName: (slug: string) => Category.findOne({ slug }),
  create: (data: Record<string, unknown>) => Category.create(data),
  update: (id: string, data: Record<string, unknown>) => Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  remove: (id: string) => Category.findByIdAndDelete(id),
  countChildren: (id: string) => Category.countDocuments({ parentCategory: id }),
  countActiveProducts: (id: string) => Product.countDocuments({ $or: [{ category: id }, { subCategories: id }], deletedAt: null }),
  countProducts: (id: string) => Product.countDocuments({ $or: [{ category: id }, { subCategories: id }], deletedAt: null }),
};
