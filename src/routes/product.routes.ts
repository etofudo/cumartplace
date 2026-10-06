import { Router } from 'express';
import * as ProductController from '../controllers/product.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// Public — browse products (supports ?category_id=&store_id=&search= query params)
router.get('/api/products',              ProductController.getAll);
router.get('/api/products/:productId',   ProductController.getOne);

// Vendor only — manage their products
router.post('/api/products',             authenticate, requireRole('vendor'), ProductController.create);
router.put('/api/products/:productId',   authenticate, requireRole('vendor'), ProductController.update);
router.delete('/api/products/:productId', authenticate, requireRole('vendor'), ProductController.remove);

export default router;
