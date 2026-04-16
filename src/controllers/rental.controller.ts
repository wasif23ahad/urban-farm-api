import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

export const createRentalSpace = async (req: Request, res: Response) => {
  const { location, size, price, availability } = req.body;
  const userId = req.user?.userId;

  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendorProfile) {
      return sendResponse(res, 403, false, 'Vendor profile not found');
    }

    const rentalSpace = await prisma.rentalSpace.create({
      data: {
        vendorId: vendorProfile.id,
        location,
        size,
        price,
        availability: availability !== undefined ? availability : true,
      },
    });

    return sendResponse(res, 201, true, 'Rental space created successfully', rentalSpace);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while creating rental space');
  }
};

export const getRentalSpaces = async (req: Request, res: Response) => {
  const { location, availability, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const where: any = {};
    if (location) where.location = { contains: String(location), mode: 'insensitive' };
    if (availability !== undefined) where.availability = availability === 'true';

    const [spaces, total] = await Promise.all([
      prisma.rentalSpace.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          vendor: {
            select: {
              farmName: true,
              farmLocation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rentalSpace.count({ where }),
    ]);

    return sendResponse(res, 200, true, 'Rental spaces fetched successfully', {
      spaces,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while fetching rental spaces');
  }
};

export const getRentalSpaceById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const space = await prisma.rentalSpace.findUnique({
      where: { id: id as string },
      include: {
        vendor: {
          select: {
            farmName: true,
            farmLocation: true,
          },
        },
      },
    });

    if (!space) {
      return sendResponse(res, 404, false, 'Rental space not found');
    }

    return sendResponse(res, 200, true, 'Rental space details fetched successfully', space);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while fetching rental space details');
  }
};
