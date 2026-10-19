import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import menuRoutes from './menu.routes.js';
import orderRoutes from './order.routes.js';
import tableRoutes from './table.routes.js';
import reservationRoutes from './reservation.routes.js';
import paymentRoutes from './payment.routes.js';
import inventoryRoutes from './inventory.routes.js';
import promoRoutes from './promo.routes.js';
import reviewRoutes from './review.routes.js';
import reportRoutes from './report.routes.js';
import settingsRoutes from './settings.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/tables', tableRoutes);
router.use('/reservations', reservationRoutes);
router.use('/payments', paymentRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/promos', promoRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);

export default router;
