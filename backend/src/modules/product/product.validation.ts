import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id');
const specification = z.object({ group: z.string().trim().min(1).max(80), key: z.string().trim().min(1).max(100), value: z.string().trim().min(1).max(500) });
const warranty = z.object({ duration: z.string().max(80).optional(), type: z.string().max(80).optional(), details: z.string().max(1000).optional() });
const booleanInput = z.union([z.boolean(), z.enum(['true', 'false']).transform((value) => value === 'true')]);

export const productListQuerySchema = z.object({
  category: z.string().trim().min(1).max(120).optional(),
  subCategory: z.string().trim().min(1).max(120).optional(),
  brand: z.string().trim().min(1).max(80).optional(),
  minPrice: z.coerce.number().finite().min(0).optional(),
  maxPrice: z.coerce.number().finite().min(0).optional(),
  search: z.string().trim().min(1).max(200).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating', 'popular']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).refine((query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice, {
  message: 'minPrice cannot exceed maxPrice', path: ['minPrice'],
});

/** Internal inventory listing includes drafts and archived products for administrators. */
export const adminProductListQuerySchema = productListQuerySchema.extend({
  status: z.enum(['active', 'draft', 'out-of-stock', 'archived']).optional(),
});

const productBaseSchema = z.object({
  name: z.string().trim().min(2).max(200),
  brand: z.string().trim().min(1).max(80),
  sku: z.string().trim().min(1).max(80),
  category: objectId,
  subCategories: z.array(objectId).default([]),
  price: z.coerce.number().finite().min(0),
  discountPrice: z.union([z.coerce.number().finite().min(0), z.literal('null').transform(() => null)]).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  shortDescription: z.string().trim().min(2).max(500),
  longDescription: z.string().trim().min(2).max(20000),
  specifications: z.array(specification).default([]),
  whatsInTheBox: z.array(z.string().trim().min(1).max(200)).default([]),
  warranty: warranty.default({}),
  termsAndConditions: z.string().trim().max(10000).optional(),
  status: z.enum(['active', 'draft', 'out-of-stock']).default('draft'),
  isFeatured: booleanInput.default(false),
});

export const productSchema = productBaseSchema.refine((product) => product.discountPrice === undefined || product.discountPrice === null || product.discountPrice <= product.price, { message: 'Discount price cannot exceed price', path: ['discountPrice'] });

export const productUpdateSchema = productBaseSchema.omit({ stock: true }).partial().refine((input) => Object.keys(input).length > 0, 'Provide at least one field to update');
export const stockSchema = z.object({ change: z.coerce.number().int().refine((value) => value !== 0, 'Stock change cannot be zero'), reason: z.enum(['restock', 'correction']).default('restock'), reference: z.string().trim().max(160).optional() });
export const statusSchema = z.object({ status: z.enum(['active', 'draft', 'out-of-stock', 'archived']) });
export const imageOperationSchema = z.object({ replace: booleanInput.default(false), thumbnailIndex: z.coerce.number().int().min(0).optional() });
