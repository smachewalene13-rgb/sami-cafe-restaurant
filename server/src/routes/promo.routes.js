import { Router } from 'express';
import * as promoController from '../controllers/promo.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.post('/validate', optionalAuth, promoController.validatePromo);
router.get('/', protect, authorize('admin', 'manager'), promoController.getAllPromos);
router.post('/', protect, authorize('admin', 'manager'), promoController.createPromo);
router.put('/:id', protect, authorize('admin', 'manager'), promoController.updatePromo);
router.delete('/:id', protect, authorize('admin', 'manager'), promoController.deletePromo);

export default router;
