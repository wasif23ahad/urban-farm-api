import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

export const addPlant = async (req: Request, res: Response) => {
  const { name, species, rentalSpaceId, growthStage, status, healthNotes } = req.body;
  const userId = req.user?.userId;

  if (!name) {
    sendResponse(res, 400, false, 'Plant name is required');
    return;
  }

  try {
    const plant = await (prisma as any).plant.create({
      data: {
        userId: userId!,
        name,
        species,
        rentalSpaceId,
        growthStage: growthStage || 'SEEDLING',
        status: status || 'HEALTHY',
        healthNotes,
      },
    });

    sendResponse(res, 201, true, 'Plant added to tracking successfully', plant);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'Server error while adding plant');
  }
};

export const getPlants = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    const plants = await (prisma as any).plant.findMany({
      where: { userId },
      include: {
        rentalSpace: {
          select: {
            location: true,
          },
        },
      },
      orderBy: { plantedAt: 'desc' },
    });

    sendResponse(res, 200, true, 'User plants fetched successfully', plants);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'Server error while fetching plants');
  }
};

export const updatePlantStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { growthStage, status, healthNotes } = req.body;
  const userId = req.user?.userId;

  try {
    const existingPlant = await (prisma as any).plant.findUnique({
      where: { id },
    });

    if (!existingPlant) {
      sendResponse(res, 404, false, 'Plant not found');
      return;
    }

    if (existingPlant.userId !== userId) {
      sendResponse(res, 403, false, 'Access denied. You do not own this plant tracker.');
      return;
    }

    const updatedPlant = await (prisma as any).plant.update({
      where: { id },
      data: {
        growthStage: growthStage || existingPlant.growthStage,
        status: status || existingPlant.status,
        healthNotes: healthNotes || existingPlant.healthNotes,
        lastChecked: new Date(),
      },
    });

    sendResponse(res, 200, true, 'Plant status updated successfully', updatedPlant);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'Server error while updating plant status');
  }
};

export const getPlantById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const plant = await (prisma as any).plant.findUnique({
      where: { id },
      include: {
        rentalSpace: true,
      },
    });

    if (!plant) {
      sendResponse(res, 404, false, 'Plant not found');
      return;
    }

    if (plant.userId !== userId) {
      sendResponse(res, 403, false, 'Access denied');
      return;
    }

    sendResponse(res, 200, true, 'Plant details fetched successfully', plant);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'Server error while fetching plant details');
  }
};
