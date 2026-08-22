import { Router } from 'express';
import { authenticateUser } from '../../middlewares/authenticateUser.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { addressController } from './address.controller.js';
import { addressSchema, updateAddressSchema } from './address.validation.js';

export const addressRouter = Router();
addressRouter.use(authenticateUser);
addressRouter.get('/', addressController.list);
addressRouter.post('/', validateRequest(addressSchema), addressController.add);
addressRouter.put('/:id', validateRequest(updateAddressSchema), addressController.update);
addressRouter.delete('/:id', addressController.remove);
addressRouter.patch('/:id/set-default', addressController.setDefault);
