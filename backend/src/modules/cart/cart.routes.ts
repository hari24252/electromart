import { Router } from 'express';
import { authenticateUser } from '../../middlewares/authenticateUser.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { cartController } from './cart.controller.js';
import { addCartItemSchema, updateCartItemSchema } from './cart.validation.js';

export const cartRouter = Router();
cartRouter.use(authenticateUser);
cartRouter.get('/', cartController.read);
cartRouter.post('/add', validateRequest(addCartItemSchema), cartController.add);
cartRouter.put('/update', validateRequest(updateCartItemSchema), cartController.update);
cartRouter.delete('/remove/:productId', cartController.remove);
cartRouter.delete('/clear', cartController.clear);
