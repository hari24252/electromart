import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authenticateAdmin.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { adminSettingsController } from './adminSettings.controller.js';
import { storeSettingsSchema } from './adminSettings.validation.js';

export const adminSettingsRouter = Router();
adminSettingsRouter.use(authenticateAdmin);
adminSettingsRouter.get('/', adminSettingsController.read);
adminSettingsRouter.put('/', validateRequest(storeSettingsSchema), adminSettingsController.update);
