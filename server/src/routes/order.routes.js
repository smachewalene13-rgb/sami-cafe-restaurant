import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.post('/', optionalAuth, orderController.createOrder);
router.get('/my', protect, orderController.getMyOrders);
router.get('/:id', optionalAuth, orderController.getOrderById);
router.get('/', protect, authorize('admin', 'manager', 'waiter', 'kitchen', 'cashier'), orderController.getAllOrders);
router.patch('/:id/status', protect, authorize('admin', 'manager', 'waiter', 'kitchen', 'cashier'), orderController.updateOrderStatus);
router.post('/:id/cancel', optionalAuth, orderController.cancelOrder);

export default router;
