import { Router } from 'express';
import { newsletterRateLimiter } from '../../middlewares/rateLimiter.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { newsletterController } from './newsletter.controller.js';
import { newsletterSubscribeSchema } from './newsletter.validation.js';

export const newsletterRouter = Router();
newsletterRouter.post('/subscribe', newsletterRateLimiter, validateRequest(newsletterSubscribeSchema), newsletterController.subscribe);
