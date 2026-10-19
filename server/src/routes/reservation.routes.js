import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.get('/availability', reservationController.checkAvailability);
router.post('/', optionalAuth, reservationController.createReservation);
router.get('/my', protect, reservationController.getMyReservations);
router.get('/', protect, authorize('admin', 'manager', 'waiter'), reservationController.getAllReservations);
router.patch('/:id/status', protect, authorize('admin', 'manager'), reservationController.updateReservationStatus);

export default router;
