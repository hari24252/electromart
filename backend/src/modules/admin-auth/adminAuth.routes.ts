import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authenticateAdmin.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { adminAuthController } from './adminAuth.controller.js';
import { adminChangePasswordSchema, adminLoginSchema, createSubAdminSchema } from './adminAuth.validation.js';

export const adminAuthRouter = Router();
adminAuthRouter.post('/login', authRateLimiter, validateRequest(adminLoginSchema), adminAuthController.login);
adminAuthRouter.post('/create-sub-admin', authenticateAdmin, validateRequest(createSubAdminSchema), adminAuthController.createSubAdmin);
adminAuthRouter.post('/refresh-token', adminAuthController.refreshToken);
adminAuthRouter.post('/logout', authenticateAdmin, adminAuthController.logout);
adminAuthRouter.get('/me', authenticateAdmin, adminAuthController.me);
adminAuthRouter.post('/change-password', authenticateAdmin, validateRequest(adminChangePasswordSchema), adminAuthController.changePassword);
