import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authenticateAdmin.js';
import { validateQuery, validateRequest } from '../../middlewares/validateRequest.js';
import { adminUsersController } from './adminUsers.controller.js';
import { usersListQuerySchema, userStatusSchema } from './adminUsers.validation.js';

export const adminUsersRouter = Router();
adminUsersRouter.use(authenticateAdmin);
adminUsersRouter.get('/', validateQuery(usersListQuerySchema), adminUsersController.list);
adminUsersRouter.patch('/:id/status', validateRequest(userStatusSchema), adminUsersController.setStatus);
