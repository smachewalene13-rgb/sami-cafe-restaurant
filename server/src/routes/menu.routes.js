import { Router } from 'express';
import * as menuController from '../controllers/menu.controller.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', menuController.getMenuItems);
router.get('/:id', menuController.getMenuItemById);
router.post('/', protect, authorize('admin', 'manager'), upload.single('image'), menuController.createMenuItem);
router.put('/:id', protect, authorize('admin', 'manager'), upload.single('image'), menuController.updateMenuItem);
router.patch('/:id/availability', protect, authorize('admin', 'manager', 'kitchen'), menuController.toggleItemAvailability);
router.delete('/:id', protect, authorize('admin'), menuController.deleteMenuItem);

export default router;
