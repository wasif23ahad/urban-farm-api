import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { Role, CertStatus } from '@prisma/client';

export const createProduce = async (req: Request, res: Response) => {
  const { name, description, price, category, availableQuantity } = req.body;
  const userId = req.user?.userId;

  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendorProfile) {
      return sendResponse(res, 403, false, 'Vendor profile not found');
    }

    const produce = await prisma.produce.create({
      data: {
        vendorId: vendorProfile.id,
        name,
        description,
        price: parseFloat(price),
        category,
        availableQuantity: parseInt(availableQuantity),
        certificationStatus: CertStatus.PENDING, // Vendors start as pending
      },
    });

    return sendResponse(res, 201, true, 'Produce listed successfully', produce);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while listing produce');
  }
};

export const getMarketplaceItems = async (req: Request, res: Response) => {
  const { category, name, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const where: any = {};
    if (category) where.category = String(category);
    if (name) where.name = { contains: String(name), mode: 'insensitive' };
    
    // Only show items that have stock and are from verified vendors (optional/pref)
    // To strictly follow PRD, we just filter by availability
    where.availableQuantity = { gt: 0 };

    const [items, total] = await Promise.all([
      prisma.produce.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          vendor: {
            select: {
              farmName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.produce.count({ where }),
    ]);

    return sendResponse(res, 200, true, 'Marketplace items fetched successfully', {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while fetching marketplace items');
  }
};

export const getProduceById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const item = await prisma.produce.findUnique({
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

    if (!item) {
      return sendResponse(res, 404, false, 'Produce item not found');
    }

    return sendResponse(res, 200, true, 'Produce details fetched successfully', item);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while fetching produce details');
  }
};
