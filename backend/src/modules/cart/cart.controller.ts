import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { getUserId } from '../shared/requireAuth.js';
import { cartService } from './cart.service.js';

export const cartController = {
  read: asyncHandler(async (req, res) => success(res, await cartService.read(getUserId(req)))),
  add: asyncHandler(async (req, res) => success(res, await cartService.add(getUserId(req), req.body.productId, req.body.quantity), 'Item added to cart')),
  update: asyncHandler(async (req, res) => success(res, await cartService.update(getUserId(req), req.body.productId, req.body.quantity), 'Cart updated')),
  remove: asyncHandler(async (req, res) => success(res, await cartService.remove(getUserId(req), req.params.productId as string), 'Item removed from cart')),
  clear: asyncHandler(async (req, res) => { await cartService.clear(getUserId(req)); return success(res, null, 'Cart cleared'); }),
};
