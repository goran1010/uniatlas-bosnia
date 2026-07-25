import { prisma } from "../db/prisma.js";
import * as transactionModel from "../models/transactionModel.js";
import { sendError, sendSuccess } from "../utils/response.js";
import * as adminValidation from "../validation/adminValidation.js";

import type { Request, Response } from "express";

async function getPendingChanges(_req: Request, res: Response) {
  const pendingChanges = await prisma.pendingChange.findMany({
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });

  sendSuccess(res, {
    data: pendingChanges,
    message: "Pending changes retrieved successfully.",
  });
}

async function declinePendingChange(req: Request, res: Response) {
  const { id } = adminValidation.declinePendingChange(req.body);

  await prisma.pendingChange.delete({ where: { id } });

  sendSuccess(res, {
    message: "Pending change declined successfully.",
  });
}

async function approvePendingChange(req: Request, res: Response) {
  const { id } = adminValidation.approvePendingChange(req.body);

  const wasApplied = await transactionModel.approvePendingChange({
    id,
  });

  if (!wasApplied) {
    sendError(res, {
      status: 404,
      message: "Pending change not found.",
    });
    return;
  }

  sendSuccess(res, {
    message: "Pending change approved successfully.",
  });
}

export { getPendingChanges, declinePendingChange, approvePendingChange };
