import { pendingChangesPostalCodeModel } from "../models/pendingChangesPostalCodeModel.js";
import { matchedData } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";
import { logger } from "../utils/logger.js";

class ContributionController {
  async createPostalCode(req, res) {
    try {
      const userId = req.user.id;
      const typeOfChange = "CREATE";
      const { city, code, post } = req.body;

      const result = await pendingChangesPostalCodeModel.create({
        userId,
        city,
        code: Number(code),
        post,
        typeOfChange,
      });

      return sendSuccess(res, {
        status: 201,
        message:
          "New postal code suggested. Admin will review the suggestion and decide whether to accept it or not.",
        data: result,
      });
    } catch (err) {
      logger.error(err);
      sendError(res, {
        status: 500,
        message: "An error occurred while suggesting a new postal code.",
      });
    }
  }

  async editPostalCode(req, res) {
    const userId = req.user.id;
    const typeOfChange = "UPDATE";
    const { city, code, post } = req.body;

    const result = await pendingChangesPostalCodeModel.create({
      userId,
      code: Number(code),
      post,
      typeOfChange,
      city,
    });

    return sendSuccess(res, {
      status: 200,
      message:
        "Postal code edit suggested. Admin will review the suggestion and decide whether to accept it or not.",
      data: result,
    });
  }

  async deletePostalCode(req, res) {
    const userId = req.user.id;
    const typeOfChange = "DELETE";
    const { code, city, post } = req.body;

    const result = await pendingChangesPostalCodeModel.create({
      userId,
      code: Number(code),
      typeOfChange,
      city,
      post,
    });

    return sendSuccess(res, {
      status: 201,
      message:
        "Postal code deletion suggested. Admin will review the suggestion and decide whether to accept it or not.",
      data: result,
    });
  }

  async getPendingChanges(req, res) {
    const { id } = req.user;
    const pendingChanges = await pendingChangesPostalCodeModel.findMany({
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

    const pendingChange = await pendingChangesPostalCodeModel.findMany({
      userId: id,
      id: pendingChangeId,
    });

    if (!pendingChange || pendingChange.length === 0) {
      return sendError(res, {
        status: 404,
        message: "Pending change not found.",
      });
    }

    await pendingChangesPostalCodeModel.delete({
      id: pendingChange[0].id,
    });

    return sendSuccess(res, {
      message: "Pending change deleted successfully.",
    });
  }
}

const contributionController = new ContributionController();

export { contributionController };
