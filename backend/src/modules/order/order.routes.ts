import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authenticateAdmin.js';
import { authenticateUser } from '../../middlewares/authenticateUser.js';
import { validateQuery, validateRequest } from '../../middlewares/validateRequest.js';
import { orderController } from './order.controller.js';
import { adminOrdersQuerySchema, cancelOrderSchema, createOrderSchema, myOrdersQuerySchema, updateOrderStatusSchema } from './order.validation.js';

export const orderRouter = Router();
orderRouter.post('/', authenticateUser, validateRequest(createOrderSchema), orderController.create);
orderRouter.get('/my-orders', authenticateUser, validateQuery(myOrdersQuerySchema), orderController.myOrders);
orderRouter.get('/my-orders/:id', authenticateUser, orderController.myOrder);
orderRouter.patch('/my-orders/:id/cancel', authenticateUser, validateRequest(cancelOrderSchema), orderController.cancel);
orderRouter.get('/', authenticateAdmin, validateQuery(adminOrdersQuerySchema), orderController.listAll);
orderRouter.get('/:id', authenticateAdmin, orderController.detail);
orderRouter.patch('/:id/status', authenticateAdmin, validateRequest(updateOrderStatusSchema), orderController.updateStatus);
