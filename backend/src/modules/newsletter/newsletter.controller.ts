import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { newsletterService } from './newsletter.service.js';

export const newsletterController = {
  subscribe: asyncHandler(async (req, res) => success(res, await newsletterService.subscribe(req.body.email), 'You are subscribed to ElectroMart updates.', 201)),
};
