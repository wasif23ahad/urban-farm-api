import { Router } from 'express';
import { createProduce, getMarketplaceItems, getProduceById } from '../controllers/produce.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', getMarketplaceItems);
router.get('/:id', getProduceById);

// Protected routes (Vendor only)
router.post('/', authenticate, authorize([Role.VENDOR]), createProduce);

export default router;
