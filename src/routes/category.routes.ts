import { Router } from 'express';
import * as CategoryController from '../controllers/category.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/api/categories',              CategoryController.getAll);
router.get('/api/categories/:categoryId',  CategoryController.getOne);

// Admin only — create a category
router.post('/api/categories', authenticate, requireRole('admin'), CategoryController.create);

export default router;
