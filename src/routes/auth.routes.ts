import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/login',    AuthController.login);

// Protected — requires a valid JWT
router.get('/api/users/me',  authenticate, AuthController.getMe);
router.put('/api/users/me',  authenticate, AuthController.updateMe);

export default router;
