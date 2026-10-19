import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/all', protect, authorize('admin', 'manager'), categoryController.getAllCategoriesAdmin);
router.post('/', protect, authorize('admin', 'manager'), categoryController.createCategory);
router.put('/:id', protect, authorize('admin', 'manager'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);

export default router;
