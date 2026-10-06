import { Router } from 'express';
import * as OrderController from '../controllers/order.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// Buyer routes
router.post('/api/orders',            authenticate, requireRole('buyer'),            OrderController.checkout);
router.get('/api/orders',             authenticate, requireRole('buyer'),            OrderController.getMyOrders);
router.get('/api/orders/:orderId',    authenticate, requireRole('buyer'),            OrderController.getOne);

// Vendor / Admin — TODO for students
router.put('/api/orders/:orderId/status', authenticate, requireRole('vendor', 'admin'), OrderController.updateStatus);

export default router;
