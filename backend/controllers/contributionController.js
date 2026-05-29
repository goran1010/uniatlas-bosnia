import { pendingChangesUniversityModel } from "../models/pendingChangesUniversityModel.js";
import { matchedData } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";
import { logger } from "../utils/logger.js";

class ContributionController {
  async createEntity(req, res) {
    try {
      const userId = req.user.id;
      const { entityType, parentId } = matchedData(req);
      const data = req.body.data;

      const result = await pendingChangesUniversityModel.create({
        userId,
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

  async editEntity(req, res) {
    try {
      const userId = req.user.id;
      const { entityType, targetId } = matchedData(req);
      const data = req.body.data;

      const result = await pendingChangesUniversityModel.create({
        userId,
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

  async deleteEntity(req, res) {
    try {
      const userId = req.user.id;
      const { entityType, targetId } = matchedData(req);

      const result = await pendingChangesUniversityModel.create({
        userId,
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

  async getPendingChanges(req, res) {
    const { id } = req.user;
    const pendingChanges = await pendingChangesUniversityModel.findMany({
      userId: id,
    });

    return sendSuccess(res, {
      data: pendingChanges,
      message: "Pending changes retrieved successfully.",
    });
  }

  async deletePendingChange(req, res) {
    const { id } = req.user;
    const { id: pendingChangeId } = matchedData(req);

    const pendingChange = await pendingChangesUniversityModel.findMany({
      userId: id,
      id: pendingChangeId,
    });

    if (!pendingChange || pendingChange.length === 0) {
      return sendError(res, {
        status: 404,
        message: "Pending change not found.",
      });
    }

    await pendingChangesUniversityModel.delete({
      id: pendingChange[0].id,
    });

    return sendSuccess(res, {
      message: "Pending change deleted successfully.",
    });
  }
}

const contributionController = new ContributionController();

export { contributionController };
