import type { Express } from 'express';
import { conflict, notFound } from '../../utils/apiError.js';
import { ensureObjectId } from '../../utils/ids.js';
import { slugifyName } from '../../utils/slug.js';
import { resolveProductImageUrls } from '../../services/media.service.js';
import { writeAdminAudit } from '../../services/audit.service.js';
import { invalidateCache, readCache, writeCache } from '../../services/cache.service.js';
import { productRepository } from './product.repository.js';

type ProductInput = {
  name?: string; brand?: string; sku?: string; category?: string; subCategories?: string[]; price?: number; discountPrice?: number | null;
  stock?: number; shortDescription?: string; longDescription?: string; specifications?: unknown[]; whatsInTheBox?: string[];
  warranty?: Record<string, unknown>; termsAndConditions?: string; status?: string; isFeatured?: boolean;
};

async function uniqueSlug(name: string, excludingId?: string): Promise<string> {
  const root = slugifyName(name);
  let slug = root;
  let suffix = 2;
  while (true) {
    const current = await productRepository.findBySlug(slug, true);
    if (!current || current._id.toString() === excludingId) return slug;
    slug = `${root}-${suffix++}`;
  }
}

async function assertCategories(category: string, subCategories: string[] = []): Promise<void> {
  const primary = await productRepository.findCategoryById(ensureObjectId(category, 'category').toString());
  if (!primary) throw notFound('Category');
  for (const subCategory of subCategories) {
    const found = await productRepository.findCategoryById(ensureObjectId(subCategory, 'subcategory').toString());
    if (!found) throw notFound('Subcategory');
  }
}

const salePrice = (product: { price: number; discountPrice?: number | null }): number => product.discountPrice ?? product.price;
const productCacheKey = (scope: string, value: unknown): string => `products:${scope}:${JSON.stringify(value)}`;

async function invalidateProductCache(): Promise<void> {
  await invalidateCache('products:');
}

export const productService = {
  async list(query: Record<string, unknown>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const cacheKey = productCacheKey('list', Object.entries(query).sort(([left], [right]) => left.localeCompare(right)));
    const cached = await readCache<{ items: unknown[]; total: number; page: number; limit: number }>(cacheKey);
    if (cached) return cached;
    const filter: Record<string, unknown> = { deletedAt: null, status: 'active' };
    if (typeof query.category === 'string') {
      const category = await productRepository.findCategoryBySlug(query.category);
      if (!category) return { items: [], page, limit, total: 0 };
      filter.category = category._id;
    }
    if (typeof query.subCategory === 'string') {
      const category = await productRepository.findCategoryBySlug(query.subCategory);
      if (!category) return { items: [], page, limit, total: 0 };
      filter.subCategories = category._id;
    }
    if (typeof query.brand === 'string') filter.brand = new RegExp(`^${query.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const minPrice = Number(query.minPrice);
    const maxPrice = Number(query.maxPrice);
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) filter.$or = [
      { discountPrice: { ...(Number.isFinite(minPrice) ? { $gte: minPrice } : {}), ...(Number.isFinite(maxPrice) ? { $lte: maxPrice } : {}) } },
      { discountPrice: { $exists: false }, price: { ...(Number.isFinite(minPrice) ? { $gte: minPrice } : {}), ...(Number.isFinite(maxPrice) ? { $lte: maxPrice } : {}) } },
      { discountPrice: null, price: { ...(Number.isFinite(minPrice) ? { $gte: minPrice } : {}), ...(Number.isFinite(maxPrice) ? { $lte: maxPrice } : {}) } },
    ];
    if (typeof query.search === 'string' && query.search.trim()) filter.$text = { $search: query.search.trim() };
    const sortBy: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { ratingsAvg: -1, ratingsCount: -1 }, popular: { soldCount: -1 },
    };
    const sort = sortBy[typeof query.sort === 'string' ? query.sort : 'newest'] ?? sortBy.newest!;
    const result = await productRepository.findWithFilters(filter, page, limit, sort);
    const response = { ...result, page, limit };
    await writeCache(cacheKey, response);
    return response;
  },

  async listAdmin(query: Record<string, unknown>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const status = typeof query.status === 'string' ? query.status : undefined;
    const filter: Record<string, unknown> = status === 'archived'
      ? { status: 'archived' }
      : { deletedAt: null, ...(status ? { status } : {}) };

    if (typeof query.category === 'string') {
      const category = await productRepository.findCategoryBySlug(query.category);
      if (!category) return { items: [], page, limit, total: 0 };
      filter.category = category._id;
    }
    if (typeof query.subCategory === 'string') {
      const category = await productRepository.findCategoryBySlug(query.subCategory);
      if (!category) return { items: [], page, limit, total: 0 };
      filter.subCategories = category._id;
    }
    if (typeof query.brand === 'string') filter.brand = new RegExp(`^${query.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    if (typeof query.search === 'string' && query.search.trim()) filter.$text = { $search: query.search.trim() };
    const sortBy: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { ratingsAvg: -1, ratingsCount: -1 }, popular: { soldCount: -1 },
    };
    const sort = sortBy[typeof query.sort === 'string' ? query.sort : 'newest'] ?? sortBy.newest!;
    const result = await productRepository.findWithFilters(filter, page, limit, sort);
    return { ...result, page, limit };
  },

  async detail(slug: string) {
    const cacheKey = productCacheKey('detail', slug);
    const cached = await readCache<unknown>(cacheKey);
    if (cached) return cached;
    const product = await productRepository.findBySlug(slug);
    if (!product) throw notFound('Product');
    await writeCache(cacheKey, product);
    return product;
  },

  async related(slug: string) {
    const cacheKey = productCacheKey('related', slug);
    const cached = await readCache<unknown[]>(cacheKey);
    if (cached) return cached;
    const product = await this.detail(slug);
    const result = await productRepository.findWithFilters({ category: product.category, _id: { $ne: product._id }, deletedAt: null, status: 'active' }, 1, 8, { ratingsAvg: -1, soldCount: -1 });
    await writeCache(cacheKey, result.items);
    return result.items;
  },

  async create(input: ProductInput, files: Express.Multer.File[], thumbnailFile: Express.Multer.File | undefined, adminId: string) {
    if (!input.name || !input.category || !input.sku || !input.brand || input.price === undefined || !input.shortDescription || !input.longDescription) throw conflict('Required product fields are missing', 'INCOMPLETE_PRODUCT');
    if (input.status === 'active' && (input.stock ?? 0) === 0) throw conflict('An active product must have stock', 'ACTIVE_PRODUCT_OUT_OF_STOCK');
    if (await productRepository.findBySku(input.sku)) throw conflict('SKU already exists', 'SKU_EXISTS');
    await assertCategories(input.category, input.subCategories);
    const images = await resolveProductImageUrls(files);
    const thumbnail = thumbnailFile ? (await resolveProductImageUrls([thumbnailFile]))[0] : images[0];
    const product = await productRepository.create({ ...input, sku: input.sku.toUpperCase(), slug: await uniqueSlug(input.name), images, ...(thumbnail ? { thumbnail } : {}) });
    if (input.stock && input.stock > 0) await productRepository.createInventoryLog({ product: product.id, change: input.stock, previousStock: 0, resultingStock: input.stock, reason: 'restock', actor: adminId, reference: 'initial product stock' });
    await writeAdminAudit(adminId, 'product.create', 'product', product.id, { sku: product.sku, stock: product.stock });
    await invalidateProductCache();
    return product;
  },

  async update(id: string, input: ProductInput, files: Express.Multer.File[], thumbnailFile: Express.Multer.File | undefined, adminId: string) {
    const productId = ensureObjectId(id, 'product').toString();
    const existing = await productRepository.findById(productId);
    if (!existing) throw notFound('Product');
    if (input.sku && input.sku.toUpperCase() !== existing.sku) {
      const duplicate = await productRepository.findBySku(input.sku);
      if (duplicate && duplicate.id !== productId) throw conflict('SKU already exists', 'SKU_EXISTS');
    }
    if (input.category || input.subCategories) await assertCategories(input.category ?? existing.category.toString(), input.subCategories ?? existing.subCategories.map((value) => value.toString()));
    const data: Record<string, unknown> = { ...input };
    if (input.sku) data.sku = input.sku.toUpperCase();
    if (input.name) data.slug = await uniqueSlug(input.name, productId);
    if (files.length) data.images = [...existing.images, ...await resolveProductImageUrls(files)];
    if (thumbnailFile) data.thumbnail = (await resolveProductImageUrls([thumbnailFile]))[0];
    const finalPrice = typeof input.price === 'number' ? input.price : existing.price;
    const finalDiscountPrice = input.discountPrice !== undefined ? input.discountPrice : existing.discountPrice;
    if (finalDiscountPrice !== undefined && finalDiscountPrice !== null && finalDiscountPrice > finalPrice) {
      throw conflict('Discount price cannot exceed price', 'INVALID_DISCOUNT_PRICE');
    }
    if (input.status === 'active' && existing.stock === 0) throw conflict('An active product must have stock', 'ACTIVE_PRODUCT_OUT_OF_STOCK');
    const product = await productRepository.update(productId, data);
    if (!product) throw notFound('Product');
    await writeAdminAudit(adminId, 'product.update', 'product', productId, input);
    await invalidateProductCache();
    return product;
  },

  async softDelete(id: string, adminId: string) {
    const product = await productRepository.softDelete(ensureObjectId(id, 'product').toString());
    if (!product) throw notFound('Product');
    await writeAdminAudit(adminId, 'product.archive', 'product', product.id);
    await invalidateProductCache();
  },

  async adjustStock(id: string, change: number, reason: 'restock' | 'correction', reference: string | undefined, adminId: string) {
    const productId = ensureObjectId(id, 'product').toString();
    const product = await productRepository.adjustStock(productId, change);
    if (!product) throw conflict('Stock cannot be reduced below zero', 'INSUFFICIENT_STOCK');
    const previousStock = product.stock - change;
    await productRepository.createInventoryLog({ product: productId, change, previousStock, resultingStock: product.stock, reason, ...(reference ? { reference } : {}), actor: adminId });
    await writeAdminAudit(adminId, 'inventory.adjust', 'product', productId, { change, reason, reference });
    await invalidateProductCache();
    return product;
  },

  async setStatus(id: string, status: string, adminId: string) {
    if (status === 'active') {
      const current = await productRepository.findById(ensureObjectId(id, 'product').toString());
      if (!current) throw notFound('Product');
      if (current.stock === 0) throw conflict('An active product must have stock', 'ACTIVE_PRODUCT_OUT_OF_STOCK');
    }
    const product = await productRepository.update(ensureObjectId(id, 'product').toString(), { status });
    if (!product) throw notFound('Product');
    await writeAdminAudit(adminId, 'product.status', 'product', product.id, { status });
    await invalidateProductCache();
    return product;
  },

  async addImages(id: string, files: Express.Multer.File[], replace: boolean, thumbnailIndex: number | undefined, adminId: string) {
    if (!files.length) throw conflict('Provide at least one image', 'IMAGES_REQUIRED');
    const productId = ensureObjectId(id, 'product').toString();
    const product = await productRepository.findById(productId);
    if (!product) throw notFound('Product');
    const uploaded = await resolveProductImageUrls(files);
    const images = replace ? uploaded : [...product.images, ...uploaded];
    if (thumbnailIndex !== undefined && !images[thumbnailIndex]) throw conflict('thumbnailIndex does not reference an uploaded product image', 'INVALID_THUMBNAIL_INDEX');
    const thumbnail = thumbnailIndex !== undefined ? images[thumbnailIndex] : (product.thumbnail ?? images[0]);
    const updated = await productRepository.update(productId, { images, ...(thumbnail ? { thumbnail } : {}) });
    if (!updated) throw notFound('Product');
    await writeAdminAudit(adminId, replace ? 'product.images.replace' : 'product.images.add', 'product', productId, { imageCount: uploaded.length });
    await invalidateProductCache();
    return updated;
  },

  async updateRatingAggregate(productId: string, ratingsAvg: number, ratingsCount: number) {
    await productRepository.updateRatingAggregate(productId, ratingsAvg, ratingsCount);
    await invalidateProductCache();
  },
  async inventoryHistory(id: string) { const productId = ensureObjectId(id, 'product').toString(); return productRepository.inventoryHistory(productId, 100); },
  salePrice,
};
