import { Router } from 'express';
import * as tableController from '../controllers/table.controller.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.get('/', tableController.getTables);
router.patch('/:id/status', protect, authorize('admin', 'manager', 'waiter', 'cashier'), tableController.updateTableStatus);
router.post('/', protect, authorize('admin', 'manager'), tableController.createTable);
router.put('/:id', protect, authorize('admin', 'manager'), tableController.updateTable);
router.delete('/:id', protect, authorize('admin'), tableController.deleteTable);

export default router;
