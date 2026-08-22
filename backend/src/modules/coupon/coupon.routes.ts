import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authenticateAdmin.js';
import { authenticateUser } from '../../middlewares/authenticateUser.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { couponController } from './coupon.controller.js';
import { applyCouponSchema, couponSchema, couponUpdateSchema } from './coupon.validation.js';

export const couponRouter = Router();
couponRouter.post('/apply', authenticateUser, validateRequest(applyCouponSchema), couponController.apply);
couponRouter.get('/', authenticateAdmin, couponController.list);
couponRouter.post('/', authenticateAdmin, validateRequest(couponSchema), couponController.create);
couponRouter.put('/:id', authenticateAdmin, validateRequest(couponUpdateSchema), couponController.update);
couponRouter.delete('/:id', authenticateAdmin, couponController.remove);
