import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.use(protect, authorize('admin', 'manager'));

router.get('/ingredients', inventoryController.getIngredients);
router.get('/low-stock', inventoryController.getLowStock);
router.post('/stock-in', inventoryController.recordStockIn);
router.post('/ingredients', inventoryController.createIngredient);

export default router;
