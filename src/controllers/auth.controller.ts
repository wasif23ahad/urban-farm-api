import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { Role } from '@prisma/client';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(res, 400, false, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role || Role.CUSTOMER,
        vendorProfile: role === Role.VENDOR ? {
            create: {
                farmName: `${name}'s Farm`,
                farmLocation: "Unknown"
            }
        } : undefined
      },
    });

    return sendResponse(res, 201, true, 'User registered successfully', { userId: user.id });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error during registration');
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return sendResponse(res, 200, true, 'Login successful', { token, role: user.role });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error during login');
  }
};
