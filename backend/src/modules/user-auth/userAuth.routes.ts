import { Router } from 'express';
import { authenticateUser } from '../../middlewares/authenticateUser.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { userAuthController } from './userAuth.controller.js';
import { changePasswordSchema, loginSchema, signupSchema, updateProfileSchema } from './userAuth.validation.js';

export const userAuthRouter = Router();
userAuthRouter.post('/signup', authRateLimiter, validateRequest(signupSchema), userAuthController.signup);
userAuthRouter.post('/login', authRateLimiter, validateRequest(loginSchema), userAuthController.login);
userAuthRouter.post('/refresh-token', userAuthController.refreshToken);
userAuthRouter.post('/logout', authenticateUser, userAuthController.logout);
userAuthRouter.get('/me', authenticateUser, userAuthController.me);
userAuthRouter.patch('/me', authenticateUser, validateRequest(updateProfileSchema), userAuthController.updateProfile);
userAuthRouter.post('/change-password', authenticateUser, validateRequest(changePasswordSchema), userAuthController.changePassword);
