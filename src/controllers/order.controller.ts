import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { Status } from '@prisma/client';

export const createOrder = async (req: Request, res: Response) => {
  const { produceId, quantity } = req.body;
  const userId = req.user?.userId;

  try {
    const produce = await prisma.produce.findUnique({
      where: { id: produceId },
    });

    if (!produce) {
      return sendResponse(res, 404, false, 'Produce item not found');
    }

    if (produce.availableQuantity < quantity) {
      return sendResponse(res, 400, false, 'Insufficient stock available');
    }

    // Atomic transaction: Create order and decrement quantity
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userId!,
          produceId,
          vendorId: produce.vendorId,
          status: Status.PENDING,
        },
      });

      await tx.produce.update({
        where: { id: produceId },
        data: {
          availableQuantity: {
            decrement: quantity,
          },
        },
      });

      return newOrder;
    });

    return sendResponse(res, 201, true, 'Order placed successfully', order);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while placing order');
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        produce: {
          select: {
            name: true,
            price: true,
          },
        },
        vendor: {
          select: {
            farmName: true,
          },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    return sendResponse(res, 200, true, 'Orders fetched successfully', orders);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while fetching orders');
  }
};
