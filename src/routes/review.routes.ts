import { Router } from 'express';
import * as ReviewController from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// Anyone can read product reviews
router.get('/api/products/:productId/reviews', ReviewController.getProductReviews);

// Buyer only — leave a review
router.post(
  '/api/products/:productId/reviews',
  authenticate,
  requireRole('buyer'),
  ReviewController.createProductReview,
);

export default router;
