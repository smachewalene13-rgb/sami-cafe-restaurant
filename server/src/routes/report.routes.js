import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.use(protect, authorize('admin', 'manager'));

router.get('/summary', reportController.getDashboardSummary);
router.get('/sales', reportController.getSalesReport);
router.get('/top-items', reportController.getTopItems);

export default router;
