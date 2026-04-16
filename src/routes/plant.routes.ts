import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  addPlant,
  getPlants,
  updatePlantStatus,
  getPlantById,
} from '../controllers/plant.controller';

const router = Router();

// All plant routes require authentication
router.use(authenticate);

router.post('/', addPlant);
router.get('/', getPlants);
router.get('/:id', getPlantById);
router.patch('/:id', updatePlantStatus);

export default router;
