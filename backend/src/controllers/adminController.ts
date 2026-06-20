import { pendingChangesModel } from "../models/pendingChangesModel.js";
import { transactionModel } from "../models/transactionModel.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { matchedData } from "express-validator";

import type { Request, Response } from "express";

class AdminController {
  async getPendingChanges(_req: Request, res: Response) {
    const pendingChanges = await pendingChangesModel.findMany();

    return sendSuccess(res, {
      data: pendingChanges,
      message: "Pending changes retrieved successfully.",
    });
  }

  async declinePendingChange(req: Request, res: Response) {
    const { id } = matchedData(req);

    await pendingChangesModel.delete({ id });

    return sendSuccess(res, {
      message: "Pending change declined successfully.",
    });
  }

  async confirmPendingChange(req: Request, res: Response) {
    const { id, entityType, typeOfChange } = matchedData(req);

    const wasApplied = await transactionModel.approveUniversityPendingChange({
      id,
      entityType,
      typeOfChange,
    });

    if (!wasApplied) {
      return sendError(res, {
        status: 404,
        message: "Pending change not found.",
      });
    }

    return sendSuccess(res, {
      message: "Pending change approved successfully.",
    });
  }
}

const adminController = new AdminController();

export { adminController };
