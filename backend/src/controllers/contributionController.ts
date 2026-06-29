import { pendingChangesModel } from "../models/pendingChangesModel.js";
import { matchedData } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";
import { logger } from "../utils/logger.js";
import {
  buildPendingChangeData,
  type ContributionEntityType,
} from "../utils/pendingChangeData.js";
import type { Request, Response } from "express";

interface ContributionRequestData {
  entityType?: ContributionEntityType;
  parentId?: string | number;
  targetId?: string | number;
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
      const { entityType: matchedEntityType, parentId } =
        matchedData<ContributionRequestData>(req, {
          includeOptionals: true,
        });
      const entityType = matchedEntityType ?? req.body.entityType;

      if (
        entityType !== "UNIVERSITY" &&
        entityType !== "FACULTY" &&
        entityType !== "STUDY_PROGRAM" &&
        entityType !== "SUBJECT"
      ) {
        return sendError(res, {
          status: 400,
          message: "Invalid entity type.",
        });
      }

      const data = buildPendingChangeData(entityType, req.body.data);

      if (!data) {
        return sendError(res, {
          status: 400,
          message: "Invalid contribution data.",
        });
      }

      const result = await pendingChangesModel.create({
        user: {
          connect: {
            id: userId,
          },
        },
        entityType,
        typeOfChange: "CREATE",
        parentId: parentId ? Number(parentId) : null,
        data,
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
      const { entityType: matchedEntityType, targetId } =
        matchedData<ContributionRequestData>(req, {
          includeOptionals: true,
        });
      const entityType = matchedEntityType ?? req.body.entityType;

      if (
        entityType !== "UNIVERSITY" &&
        entityType !== "FACULTY" &&
        entityType !== "STUDY_PROGRAM" &&
        entityType !== "SUBJECT"
      ) {
        return sendError(res, {
          status: 400,
          message: "Invalid entity type.",
        });
      }

      const data = buildPendingChangeData(entityType, req.body.data);

      if (!data) {
        return sendError(res, {
          status: 400,
          message: "Invalid contribution data.",
        });
      }

      const result = await pendingChangesModel.create({
        user: {
          connect: {
            id: userId,
          },
        },
        entityType,
        typeOfChange: "UPDATE",
        targetId: Number(targetId),
        data,
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
      const { entityType, targetId } = matchedData(req);

      const result = await pendingChangesModel.create({
        user: {
          connect: {
            id: userId,
          },
        },
        entityType,
        typeOfChange: "DELETE",
        targetId: Number(targetId),
        data: {},
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
    const pendingChanges = await pendingChangesModel.findMany({
      userId: id,
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

    const pendingChange = await pendingChangesModel.findMany({
      userId: id,
      id: pendingChangeId,
    });

    if (!pendingChange || pendingChange.length === 0) {
      return sendError(res, {
        status: 404,
        message: "Pending change not found.",
      });
    }

    await pendingChangesModel.delete({
      id: pendingChangeId,
    });

    return sendSuccess(res, {
      message: "Pending change deleted successfully.",
    });
  }
}

const contributionController = new ContributionController();

export { contributionController };
