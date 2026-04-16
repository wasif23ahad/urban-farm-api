import { Router } from 'express';
import { createOrder, getUserOrders } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (Any authenticated user)
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getUserOrders);

export default router;
