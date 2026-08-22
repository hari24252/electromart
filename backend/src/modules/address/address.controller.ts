import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { getUserId } from '../shared/requireAuth.js';
import { addressService } from './address.service.js';

export const addressController = {
  list: asyncHandler(async (req, res) => success(res, await addressService.list(getUserId(req)))),
  add: asyncHandler(async (req, res) => success(res, await addressService.add(getUserId(req), req.body), 'Address added', 201)),
  update: asyncHandler(async (req, res) => success(res, await addressService.update(getUserId(req), req.params.id as string, req.body), 'Address updated')),
  remove: asyncHandler(async (req, res) => { await addressService.remove(getUserId(req), req.params.id as string); return success(res, null, 'Address removed'); }),
  setDefault: asyncHandler(async (req, res) => success(res, await addressService.setDefault(getUserId(req), req.params.id as string), 'Default address updated')),
};
