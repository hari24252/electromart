import { Category } from '../../models/category.model.js';
import { Product } from '../../models/product.model.js';

export const categoryRepository = {
  findAll: () => Category.find({}).sort({ sortOrder: 1, name: 1 }).lean(),
  findBySlug: (slug: string) => Category.findOne({ slug }).lean(),
  findById: (id: string) => Category.findById(id),
  findBySlugOrName: (slug: string) => Category.findOne({ slug }),
  create: (data: Record<string, unknown>) => Category.create(data),
  update: (id: string, data: Record<string, unknown>) => Category.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }),
  remove: (id: string) => Category.findByIdAndDelete(id),
  countChildren: (id: string) => Category.countDocuments({ parentCategory: id }),
  countActiveProducts: (id: string) => Product.countDocuments({ $or: [{ category: id }, { subCategories: id }], deletedAt: null }),
  countProducts: (id: string) => Product.countDocuments({ $or: [{ category: id }, { subCategories: id }], deletedAt: null }),
  
  async getProductCountsForAllCategories() {
    // Aggregate product counts for all categories efficiently
    const results = await Product.aggregate([
      { $match: { deletedAt: null } },
      {
        $facet: {
          mainCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          subCategories: [
            { $unwind: '$subCategories' },
            { $group: { _id: '$subCategories', count: { $sum: 1 } } }
          ]
        }
      }
    ]);
    
    // Merge both results
    const countMap = new Map<string, number>();
    const allCounts = [...(results[0]?.mainCategory || []), ...(results[0]?.subCategories || [])];
    
    for (const item of allCounts) {
      const categoryId = item._id?.toString();
      if (categoryId) {
        countMap.set(categoryId, (countMap.get(categoryId) || 0) + item.count);
      }
    }
    
    return Array.from(countMap.entries()).map(([_id, count]) => ({ _id, count }));
  },
};
