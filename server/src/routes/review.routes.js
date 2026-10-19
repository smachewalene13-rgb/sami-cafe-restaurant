import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/menu/:id', reviewController.getItemReviews);
router.post('/', protect, reviewController.addReview);

export default router;
