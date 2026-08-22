import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { getAdminId } from '../shared/requireAuth.js';
import { categoryService } from './category.service.js';

export const categoryController = {
  tree: asyncHandler(async (_req, res) => success(res, await categoryService.tree())),
  bySlug: asyncHandler(async (req, res) => success(res, await categoryService.bySlug(req.params.slug as string))),
  create: asyncHandler(async (req, res) => success(res, await categoryService.create(req.body, getAdminId(req)), 'Category created', 201)),
  update: asyncHandler(async (req, res) => success(res, await categoryService.update(req.params.id as string, req.body, getAdminId(req)), 'Category updated')),
  remove: asyncHandler(async (req, res) => { await categoryService.remove(req.params.id as string, getAdminId(req)); return success(res, null, 'Category deleted'); }),
};
