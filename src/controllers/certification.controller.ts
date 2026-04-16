import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { CertStatus } from '@prisma/client';

export const submitCertification = async (req: Request, res: Response) => {
  const { certifyingAgency, certificationDate, documentUrl } = req.body;
  const userId = req.user?.userId;

  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendorProfile) {
      sendResponse(res, 403, false, 'Only vendors can submit certifications');
      return;
    }

    const certification = await (prisma as any).sustainabilityCert.create({
      data: {
        vendorId: vendorProfile.id,
        certifyingAgency,
        certificationDate: new Date(certificationDate),
        documentUrl,
        status: CertStatus.PENDING,
      },
    });

    sendResponse(res, 201, true, 'Sustainability certification submitted successfully', certification);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'Server error while submitting certification');
  }
};

export const getPendingCertifications = async (req: Request, res: Response) => {
  try {
    const certifications = await (prisma as any).sustainabilityCert.findMany({
      where: { status: CertStatus.PENDING },
      include: {
        vendor: {
          select: {
            farmName: true,
            farmLocation: true,
          },
        },
      },
    });

    sendResponse(res, 200, true, 'Pending certifications fetched successfully', certifications);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'Server error while fetching certifications');
  }
};

export const validateCertification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // VERIFIED or REJECTED

  if (status !== CertStatus.VERIFIED && status !== CertStatus.REJECTED) {
    sendResponse(res, 400, false, 'Invalid status. Must be VERIFIED or REJECTED');
    return;
  }

  try {
    const certification = await (prisma as any).sustainabilityCert.findUnique({
      where: { id },
    });

    if (!certification) {
      sendResponse(res, 404, false, 'Certification record not found');
      return;
    }

    // Update certification record
    const updatedCert = await (prisma as any).sustainabilityCert.update({
      where: { id },
      data: { status: status as CertStatus },
    });

    // If verified, update vendor profile status
    if (status === CertStatus.VERIFIED) {
      await prisma.vendorProfile.update({
        where: { id: certification.vendorId },
        data: { certificationStatus: CertStatus.VERIFIED },
      });
    }

    sendResponse(res, 200, true, `Certification ${status.toLowerCase()} successfully`, updatedCert);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'Server error while validating certification');
  }
};
