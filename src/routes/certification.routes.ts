import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';
import {
  submitCertification,
  getPendingCertifications,
  validateCertification,
} from '../controllers/certification.controller';

const router = Router();

// Vendor route: Submit certification
router.post('/', authenticate, authorize([Role.VENDOR]), submitCertification);

// Admin routes: Manage certifications
router.get('/pending', authenticate, authorize([Role.ADMIN]), getPendingCertifications);
router.patch('/:id/validate', authenticate, authorize([Role.ADMIN]), validateCertification);

export default router;
