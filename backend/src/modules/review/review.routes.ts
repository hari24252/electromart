import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authenticateAdmin.js';
import { authenticateAny } from '../../middlewares/authenticateAny.js';
import { authenticateUser } from '../../middlewares/authenticateUser.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { reviewController } from './review.controller.js';
import { moderationSchema, reviewSchema, reviewUpdateSchema } from './review.validation.js';

export const reviewRouter = Router();
reviewRouter.get('/product/:productId', reviewController.list);
reviewRouter.post('/product/:productId', authenticateUser, validateRequest(reviewSchema), reviewController.create);
reviewRouter.put('/:id', authenticateUser, validateRequest(reviewUpdateSchema), reviewController.update);
reviewRouter.delete('/:id', authenticateAny, reviewController.remove);
reviewRouter.patch('/:id/moderate', authenticateAdmin, validateRequest(moderationSchema), reviewController.moderate);
