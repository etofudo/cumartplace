import { Router } from 'express';
import * as CartController from '../controllers/cart.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// All cart routes require authentication (buyer only)
router.get('/api/cart',                   authenticate, requireRole('buyer'), CartController.getCart);
router.post('/api/cart/items',            authenticate, requireRole('buyer'), CartController.addItem);

// TODO for students — these controllers are stubbed out
router.put('/api/cart/items/:cartItemId', authenticate, requireRole('buyer'), CartController.updateItem);
router.delete('/api/cart/items/:cartItemId', authenticate, requireRole('buyer'), CartController.removeItem);

export default router;
