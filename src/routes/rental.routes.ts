import { Router } from 'express';
import { createRentalSpace, getRentalSpaces, getRentalSpaceById } from '../controllers/rental.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', getRentalSpaces);
router.get('/:id', getRentalSpaceById);

// Protected routes (Vendor only)
router.post('/', authenticate, authorize([Role.VENDOR]), createRentalSpace);

export default router;
