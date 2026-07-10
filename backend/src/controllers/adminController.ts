import { prisma } from "../db/prisma.js";
import { transactionModel } from "../models/transactionModel.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { matchedData } from "express-validator";

import type { Request, Response } from "express";

class AdminController {
  getPendingChanges = async (_req: Request, res: Response) => {
    const pendingChanges = await prisma.pendingChange.findMany();

    sendSuccess(res, {
      data: pendingChanges,
      message: "Pending changes retrieved successfully.",
    });
  };

  declinePendingChange = async (req: Request, res: Response) => {
    const { id } = matchedData<{ id: string }>(req);

    await prisma.pendingChange.delete({ where: { id } });

    sendSuccess(res, {
      message: "Pending change declined successfully.",
    });
  };

  approvePendingChange = async (req: Request, res: Response) => {
    const { id } = matchedData<{ id: string }>(req);

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
  };
}

const adminController = new AdminController();

export { adminController };
