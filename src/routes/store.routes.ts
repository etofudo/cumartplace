import { Router } from 'express';
import * as StoreController from '../controllers/store.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// Public — anyone can browse stores
router.get('/api/stores',                      StoreController.getAll);
router.get('/api/stores/:storeId',             StoreController.getOne);

// Vendor only — manage their store
router.post('/api/stores', authenticate, requireRole('vendor'), StoreController.create);
router.put('/api/stores/:storeId', authenticate, requireRole('vendor'), StoreController.update);

// Store ratings — TODO for students
router.get('/api/stores/:storeId/ratings',     authenticate, StoreController.getStoreRatings);
router.post('/api/stores/:storeId/rate', authenticate, requireRole('buyer'), StoreController.rateStore);

export default router;
