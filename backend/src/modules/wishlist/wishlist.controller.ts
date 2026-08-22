import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { getUserId } from '../shared/requireAuth.js';
import { wishlistService } from './wishlist.service.js';

export const wishlistController = {
  list: asyncHandler(async (req, res) => success(res, await wishlistService.list(getUserId(req)))),
  add: asyncHandler(async (req, res) => success(res, await wishlistService.add(getUserId(req), req.params.productId as string), 'Product added to wishlist')),
  remove: asyncHandler(async (req, res) => { await wishlistService.remove(getUserId(req), req.params.productId as string); return success(res, null, 'Product removed from wishlist'); }),
};
