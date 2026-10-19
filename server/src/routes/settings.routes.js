import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.get('/', settingsController.getSettings);
router.put('/', protect, authorize('admin'), settingsController.updateSettings);

// Notifications Management
router.get('/notifications/logs', protect, authorize('admin', 'manager'), settingsController.getNotificationLogs);
router.post('/notifications/test-telegram', protect, authorize('admin'), settingsController.sendTestTelegram);
router.post('/notifications/test-sms', protect, authorize('admin'), settingsController.sendTestSms);

export default router;
