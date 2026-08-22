import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authenticateAdmin.js';
import { parseProductMultipart } from '../../middlewares/parseMultipart.js';
import { productImageUpload, productUpload } from '../../middlewares/fileUpload.js';
import { validateQuery, validateRequest } from '../../middlewares/validateRequest.js';
import { productController } from './product.controller.js';
import { adminProductListQuerySchema, imageOperationSchema, productListQuerySchema, productSchema, productUpdateSchema, statusSchema, stockSchema } from './product.validation.js';

export const productRouter = Router();
productRouter.get('/', validateQuery(productListQuerySchema), productController.list);
productRouter.get('/:slug/related', productController.related);
productRouter.get('/:slug', productController.detail);
productRouter.post('/', authenticateAdmin, productUpload, parseProductMultipart, validateRequest(productSchema), productController.create);
productRouter.put('/:id', authenticateAdmin, productUpload, parseProductMultipart, validateRequest(productUpdateSchema), productController.update);
productRouter.delete('/:id', authenticateAdmin, productController.remove);
productRouter.patch('/:id/stock', authenticateAdmin, validateRequest(stockSchema), productController.adjustStock);
productRouter.patch('/:id/status', authenticateAdmin, validateRequest(statusSchema), productController.setStatus);
productRouter.post('/:id/images', authenticateAdmin, productImageUpload, validateRequest(imageOperationSchema), productController.addImages);
productRouter.get('/:id/inventory-history', authenticateAdmin, productController.inventoryHistory);

/** Kept under the admin prefix so credentials are selected correctly by API clients. */
export const adminProductRouter = Router();
adminProductRouter.use(authenticateAdmin);
adminProductRouter.get('/', validateQuery(adminProductListQuerySchema), productController.listAdmin);
