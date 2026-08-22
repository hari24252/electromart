import { Router } from 'express';
import { authenticateUser } from '../../middlewares/authenticateUser.js';
import { wishlistController } from './wishlist.controller.js';

export const wishlistRouter = Router();
wishlistRouter.use(authenticateUser);
wishlistRouter.get('/', wishlistController.list);
wishlistRouter.post('/add/:productId', wishlistController.add);
wishlistRouter.delete('/remove/:productId', wishlistController.remove);
