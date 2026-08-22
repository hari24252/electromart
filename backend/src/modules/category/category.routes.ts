import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authenticateAdmin.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { categoryController } from './category.controller.js';
import { createCategorySchema, updateCategorySchema } from './category.validation.js';

export const categoryRouter = Router();
categoryRouter.get('/', categoryController.tree);
categoryRouter.get('/:slug', categoryController.bySlug);
categoryRouter.post('/', authenticateAdmin, validateRequest(createCategorySchema), categoryController.create);
categoryRouter.put('/:id', authenticateAdmin, validateRequest(updateCategorySchema), categoryController.update);
categoryRouter.delete('/:id', authenticateAdmin, categoryController.remove);
