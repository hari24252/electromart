import type { Express } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { paginated, success } from '../../utils/apiResponse.js';
import { getAdminId } from '../shared/requireAuth.js';
import { productService } from './product.service.js';

const uploaded = (files: Express.Request['files'], field: string): Express.Multer.File[] => Array.isArray(files) ? files : ((files as Record<string, Express.Multer.File[]> | undefined)?.[field] ?? []);

export const productController = {
  list: asyncHandler(async (req, res) => { const result = await productService.list(req.validatedQuery ?? req.query); return paginated(res, result.items, result.page, result.limit, result.total); }),
  listAdmin: asyncHandler(async (req, res) => { const result = await productService.listAdmin(req.validatedQuery ?? req.query); return paginated(res, result.items, result.page, result.limit, result.total); }),
  detail: asyncHandler(async (req, res) => success(res, await productService.detail(req.params.slug as string))),
  related: asyncHandler(async (req, res) => success(res, await productService.related(req.params.slug as string))),
  create: asyncHandler(async (req, res) => success(res, await productService.create(req.body, uploaded(req.files, 'images'), uploaded(req.files, 'thumbnail')[0], getAdminId(req)), 'Product created', 201)),
  update: asyncHandler(async (req, res) => success(res, await productService.update(req.params.id as string, req.body, uploaded(req.files, 'images'), uploaded(req.files, 'thumbnail')[0], getAdminId(req)), 'Product updated')),
  remove: asyncHandler(async (req, res) => { await productService.softDelete(req.params.id as string, getAdminId(req)); return success(res, null, 'Product archived'); }),
  adjustStock: asyncHandler(async (req, res) => success(res, await productService.adjustStock(req.params.id as string, req.body.change, req.body.reason, req.body.reference, getAdminId(req)), 'Inventory updated')),
  setStatus: asyncHandler(async (req, res) => success(res, await productService.setStatus(req.params.id as string, req.body.status, getAdminId(req)), 'Product status updated')),
  addImages: asyncHandler(async (req, res) => success(res, await productService.addImages(req.params.id as string, uploaded(req.files, 'images'), req.body.replace, req.body.thumbnailIndex, getAdminId(req)), 'Product images updated')),
  inventoryHistory: asyncHandler(async (req, res) => success(res, await productService.inventoryHistory(req.params.id as string))),
};
