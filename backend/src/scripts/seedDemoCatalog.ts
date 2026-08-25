import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { logger } from '../config/logger.js';
import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';

type CategoryDefinition = {
  name: string;
  slug: string;
  parentSlug?: string;
  sortOrder: number;
};

type DemoProduct = {
  name: string;
  brand: string;
  sku: string;
  category: string;
  subCategory: string;
  price: number;
  discountPrice?: number;
  stock: number;
  featured?: boolean;
  rating: number;
  ratingsCount: number;
};

const categories: CategoryDefinition[] = [
  { name: 'Smartphones', slug: 'smartphones', sortOrder: 1 },
  { name: 'Laptops', slug: 'laptops', sortOrder: 2 },
  { name: 'Audio', slug: 'audio', sortOrder: 3 },
  { name: 'Wearables', slug: 'wearables', sortOrder: 4 },
  { name: 'Gaming', slug: 'gaming', sortOrder: 5 },
  { name: 'Cameras', slug: 'cameras', sortOrder: 6 },
  { name: 'Accessories', slug: 'accessories', sortOrder: 7 },
  { name: 'Android Phones', slug: 'android-phones', parentSlug: 'smartphones', sortOrder: 1 },
  { name: 'Premium Laptops', slug: 'premium-laptops', parentSlug: 'laptops', sortOrder: 1 },
  { name: 'Headphones', slug: 'headphones', parentSlug: 'audio', sortOrder: 1 },
  { name: 'Smartwatches', slug: 'smartwatches', parentSlug: 'wearables', sortOrder: 1 },
  { name: 'Consoles & Controllers', slug: 'consoles-controllers', parentSlug: 'gaming', sortOrder: 1 },
  { name: 'Mirrorless Cameras', slug: 'mirrorless-cameras', parentSlug: 'cameras', sortOrder: 1 },
  { name: 'Computer Accessories', slug: 'computer-accessories', parentSlug: 'accessories', sortOrder: 1 },
];

const products: DemoProduct[] = [
  { name: 'Nova X1 Pro 5G', brand: 'Apex', sku: 'DEMO-PHONE-001', category: 'smartphones', subCategory: 'android-phones', price: 74999, discountPrice: 69999, stock: 18, featured: true, rating: 4.7, ratingsCount: 142 },
  { name: 'Vertex Lite 5G', brand: 'Apex', sku: 'DEMO-PHONE-002', category: 'smartphones', subCategory: 'android-phones', price: 32999, discountPrice: 29999, stock: 32, rating: 4.4, ratingsCount: 89 },
  { name: 'Orbit Fold', brand: 'Zenith', sku: 'DEMO-PHONE-003', category: 'smartphones', subCategory: 'android-phones', price: 119999, discountPrice: 109999, stock: 9, featured: true, rating: 4.8, ratingsCount: 58 },
  { name: 'StudioBook 14', brand: 'Vertex', sku: 'DEMO-LAPTOP-001', category: 'laptops', subCategory: 'premium-laptops', price: 94999, discountPrice: 89999, stock: 14, featured: true, rating: 4.8, ratingsCount: 211 },
  { name: 'WorkMate Air 13', brand: 'Vertex', sku: 'DEMO-LAPTOP-002', category: 'laptops', subCategory: 'premium-laptops', price: 64999, stock: 21, rating: 4.5, ratingsCount: 126 },
  { name: 'Pulse G16 Gaming Laptop', brand: 'Bolt', sku: 'DEMO-LAPTOP-003', category: 'laptops', subCategory: 'premium-laptops', price: 124999, discountPrice: 114999, stock: 7, featured: true, rating: 4.6, ratingsCount: 74 },
  { name: 'Aurora Noise-Cancelling Headphones', brand: 'Echo', sku: 'DEMO-AUDIO-001', category: 'audio', subCategory: 'headphones', price: 19999, discountPrice: 15999, stock: 40, featured: true, rating: 4.7, ratingsCount: 319 },
  { name: 'Wave Mini Wireless Earbuds', brand: 'Echo', sku: 'DEMO-AUDIO-002', category: 'audio', subCategory: 'headphones', price: 5999, discountPrice: 4499, stock: 65, rating: 4.3, ratingsCount: 201 },
  { name: 'RoomBeat Portable Speaker', brand: 'Sonic', sku: 'DEMO-AUDIO-003', category: 'audio', subCategory: 'headphones', price: 8999, stock: 27, rating: 4.4, ratingsCount: 93 },
  { name: 'Summit GPS Watch', brand: 'Tempo', sku: 'DEMO-WEAR-001', category: 'wearables', subCategory: 'smartwatches', price: 24999, discountPrice: 21999, stock: 24, featured: true, rating: 4.6, ratingsCount: 155 },
  { name: 'Active Band 3', brand: 'Tempo', sku: 'DEMO-WEAR-002', category: 'wearables', subCategory: 'smartwatches', price: 4999, stock: 51, rating: 4.2, ratingsCount: 178 },
  { name: 'Classic Steel Smartwatch', brand: 'North', sku: 'DEMO-WEAR-003', category: 'wearables', subCategory: 'smartwatches', price: 17999, discountPrice: 14999, stock: 19, rating: 4.5, ratingsCount: 84 },
  { name: 'Arcade One Console', brand: 'PixelForge', sku: 'DEMO-GAME-001', category: 'gaming', subCategory: 'consoles-controllers', price: 49999, discountPrice: 46999, stock: 11, featured: true, rating: 4.8, ratingsCount: 267 },
  { name: 'Precision Wireless Controller', brand: 'PixelForge', sku: 'DEMO-GAME-002', category: 'gaming', subCategory: 'consoles-controllers', price: 6999, stock: 37, rating: 4.6, ratingsCount: 190 },
  { name: 'Strike Mechanical Keyboard', brand: 'Bolt', sku: 'DEMO-GAME-003', category: 'gaming', subCategory: 'consoles-controllers', price: 7999, discountPrice: 6499, stock: 29, rating: 4.5, ratingsCount: 117 },
  { name: 'FramePro Mirrorless Camera', brand: 'Lumix', sku: 'DEMO-CAMERA-001', category: 'cameras', subCategory: 'mirrorless-cameras', price: 87999, discountPrice: 82999, stock: 12, featured: true, rating: 4.7, ratingsCount: 98 },
  { name: 'Creator Compact Camera', brand: 'Lumix', sku: 'DEMO-CAMERA-002', category: 'cameras', subCategory: 'mirrorless-cameras', price: 45999, stock: 16, rating: 4.4, ratingsCount: 67 },
  { name: 'Traveller Camera Kit', brand: 'Vista', sku: 'DEMO-CAMERA-003', category: 'cameras', subCategory: 'mirrorless-cameras', price: 62999, discountPrice: 57999, stock: 8, rating: 4.6, ratingsCount: 51 },
  { name: 'Glide Ergonomic Mouse', brand: 'Keyline', sku: 'DEMO-ACC-001', category: 'accessories', subCategory: 'computer-accessories', price: 4499, discountPrice: 3799, stock: 70, rating: 4.5, ratingsCount: 233 },
  { name: 'Dock 12-in-1 USB-C Hub', brand: 'Keyline', sku: 'DEMO-ACC-002', category: 'accessories', subCategory: 'computer-accessories', price: 6999, stock: 43, rating: 4.4, ratingsCount: 146 },
  { name: 'ChargeMax 65W Adapter', brand: 'Volt', sku: 'DEMO-ACC-003', category: 'accessories', subCategory: 'computer-accessories', price: 2999, discountPrice: 2499, stock: 86, rating: 4.6, ratingsCount: 275 },
];

/** Adds a replaceable catalogue for local previews without overwriting existing products. */
export async function seedDemoCatalog(): Promise<{ categoriesCreated: number; productsCreated: number }> {
  const categoryIds = new Map<string, string>();
  let categoriesCreated = 0;
  let productsCreated = 0;

  for (const category of categories.filter((item) => !item.parentSlug)) {
    const existing = await Category.findOne({ slug: category.slug }).lean();
    if (!existing) categoriesCreated++;
    const stored = await Category.findOneAndUpdate(
      { slug: category.slug },
      { $setOnInsert: { name: category.name, slug: category.slug, parentCategory: null, isActive: true, sortOrder: category.sortOrder } },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
    );
    categoryIds.set(category.slug, stored.id);
  }

  for (const category of categories.filter((item) => item.parentSlug)) {
    const parentCategory = categoryIds.get(category.parentSlug!);
    if (!parentCategory) throw new Error(`Demo category parent ${category.parentSlug} was not created`);
    const existing = await Category.findOne({ slug: category.slug }).lean();
    if (!existing) categoriesCreated++;
    const stored = await Category.findOneAndUpdate(
      { slug: category.slug },
      { $setOnInsert: { name: category.name, slug: category.slug, parentCategory, isActive: true, sortOrder: category.sortOrder } },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
    );
    categoryIds.set(category.slug, stored.id);
  }

  for (const product of products) {
    const category = categoryIds.get(product.category);
    const subCategory = categoryIds.get(product.subCategory);
    if (!category || !subCategory) throw new Error(`Demo product ${product.sku} references an unavailable category`);
    const existing = await Product.exists({ sku: product.sku });
    if (!existing) productsCreated++;
    await Product.updateOne(
      { sku: product.sku },
      {
        $setOnInsert: {
          name: product.name,
          slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          brand: product.brand,
          sku: product.sku,
          category,
          subCategories: [subCategory],
          price: product.price,
          ...(product.discountPrice ? { discountPrice: product.discountPrice } : {}),
          stock: product.stock,
          images: [],
          shortDescription: `${product.name} is a demo product for previewing the ElectroMart storefront.`,
          longDescription: `This placeholder listing shows how ${product.name} will appear in the catalogue. Its specifications, description, and photographs can be replaced from the administrator dashboard later.`,
          specifications: [
            { group: 'Preview details', key: 'Catalogue status', value: 'Demo product' },
            { group: 'Preview details', key: 'Availability', value: 'In stock' },
          ],
          whatsInTheBox: [product.name, 'Quick-start guide', 'Warranty card'],
          warranty: { duration: '1 year', type: 'Demo warranty', details: 'Replace these details with the manufacturer warranty.' },
          termsAndConditions: 'Demo listing. Product details and images will be updated before sale.',
          status: 'active',
          isFeatured: Boolean(product.featured),
          ratingsAvg: product.rating,
          ratingsCount: product.ratingsCount,
          soldCount: Math.max(0, product.ratingsCount - 10),
        },
      },
      { upsert: true },
    );
  }

  logger.info({ categoriesCreated, productsCreated, totalDemoProducts: products.length }, 'Demo catalogue is ready');
  return { categoriesCreated, productsCreated };
}

async function main(): Promise<void> {
  await connectDatabase();
  await seedDemoCatalog();
  await disconnectDatabase();
}

const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedFile && fileURLToPath(import.meta.url) === invokedFile) {
  void main().catch(async (error: unknown) => {
    logger.error({ err: error }, 'Demo catalogue seed failed');
    await disconnectDatabase();
    process.exitCode = 1;
  });
}
