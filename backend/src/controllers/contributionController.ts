import { prisma } from "../db/prisma.js";
import { matchedData } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";
import { logger } from "../utils/logger.js";
import {
  type SanitizedPendingChangeData,
  type ContributionEntityType,
} from "../utils/pendingChangeData.js";
import type { Request, Response } from "express";

interface ContributionRequestData {
  entityType: ContributionEntityType;
  parentId?: number;
  targetId?: number;
  data?: SanitizedPendingChangeData;
}

class ContributionController {
  async createEntity(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, {
          status: 401,
          message: "Authentication required: log in and try again.",
        });
      }
      const userId = req.user.id;
      const { entityType, parentId, data } =
        matchedData<ContributionRequestData>(req, {
          includeOptionals: true,
        });

      if (!data) {
        return sendError(res, {
          status: 400,
          message: "Invalid contribution data.",
        });
      }

      const result = await prisma.pendingChange.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          entityType,
          typeOfChange: "CREATE",
          parentId: parentId ? Number(parentId) : null,
          data,
        },
      });

      return sendSuccess(res, {
        status: 201,
        message: "Suggestion submitted. An admin will review it.",
        data: result,
      });
    } catch (err) {
      logger.error(err);
      return sendError(res, {
        status: 500,
        message: "An error occurred while submitting the suggestion.",
      });
    }
  }

  async editEntity(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, {
          status: 401,
          message: "Authentication required: log in and try again.",
        });
      }
      const userId = req.user.id;
      const { entityType, targetId, data } =
        matchedData<ContributionRequestData>(req, {
          includeOptionals: true,
        });

      if (!data) {
        return sendError(res, {
          status: 400,
          message: "Invalid contribution data.",
        });
      }

      const result = await prisma.pendingChange.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },

          entityType,
          typeOfChange: "UPDATE",
          targetId: Number(targetId),
          data,
        },
      });

      return sendSuccess(res, {
        status: 201,
        message: "Edit suggestion submitted. An admin will review it.",
        data: result,
      });
    } catch (err) {
      logger.error(err);
      return sendError(res, {
        status: 500,
        message: "An error occurred while submitting the edit suggestion.",
      });
    }
  }

  async deleteEntity(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, {
          status: 401,
          message: "Authentication required: log in and try again.",
        });
      }
      const userId = req.user.id;
      const { entityType, targetId } = matchedData<ContributionRequestData>(
        req,
        {
          includeOptionals: true,
        },
      );

      const result = await prisma.pendingChange.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          entityType,
          typeOfChange: "DELETE",
          targetId: Number(targetId),
          data: {},
        },
      });

      return sendSuccess(res, {
        status: 201,
        message: "Deletion suggestion submitted. An admin will review it.",
        data: result,
      });
    } catch (err) {
      logger.error(err);
      return sendError(res, {
        status: 500,
        message: "An error occurred while submitting the deletion suggestion.",
      });
    }
  }

  async getPendingChanges(req: Request, res: Response) {
    if (!req.user) {
      return sendError(res, {
        status: 401,
        message: "Authentication required: log in and try again.",
      });
    }
    const { id } = req.user;
    const pendingChanges = await prisma.pendingChange.findMany({
      where: { userId: id },
    });

    return sendSuccess(res, {
      data: pendingChanges,
      message: "Pending changes retrieved successfully.",
    });
  }

  async deletePendingChange(req: Request, res: Response) {
    if (!req.user) {
      return sendError(res, {
        status: 401,
        message: "Authentication required: log in and try again.",
      });
    }
    const { id } = req.user;
    const { id: pendingChangeId } = matchedData(req);

    const pendingChange = await prisma.pendingChange.findMany({
      where: { userId: id, id: pendingChangeId },
    });

    if (!pendingChange || pendingChange.length === 0) {
      return sendError(res, {
        status: 404,
        message: "Pending change not found.",
      });
    }

    await prisma.pendingChange.delete({
      where: { id: pendingChangeId },
    });

    return sendSuccess(res, {
      message: "Pending change deleted successfully.",
    });
  }
}

const contributionController = new ContributionController();

export { contributionController };
