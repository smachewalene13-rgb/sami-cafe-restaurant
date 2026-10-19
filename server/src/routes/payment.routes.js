import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/initiate', optionalAuth, paymentController.initiatePayment);
router.post('/webhook', paymentController.paymentWebhook);
router.post('/cash', optionalAuth, paymentController.recordCashPayment);

export default router;
