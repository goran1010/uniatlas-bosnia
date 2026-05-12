import { pendingChangesPostalCodeModel } from "../models/pendingChangesPostalCodeModel.js";
import { postalCodesModel } from "../models/postalCodesModel.js";
import { sendSuccess } from "../utils/response.js";
import { matchedData } from "express-validator";

class AdminController {
  async getPendingChanges(req, res) {
    const pendingChanges = await pendingChangesPostalCodeModel.findMany();

    return sendSuccess(res, {
      data: pendingChanges,
      message: "Pending changes retrieved successfully.",
    });
  }

  async declinePendingChange(req, res) {
    const { id } = matchedData(req);

    await pendingChangesPostalCodeModel.delete({ id });

    return sendSuccess(res, {
      message: "Pending change declined successfully.",
    });
  }

  async confirmPendingChange(req, res) {
    const { id, typeOfChange } = matchedData(req);

    const pendingChange = await pendingChangesPostalCodeModel.findMany({ id });

    if (!pendingChange || pendingChange.length === 0) {
      return res.status(404).json({
        error: "Pending change not found.",
      });
    }

    const change = pendingChange[0];

    if (typeOfChange === "CREATE") {
      await postalCodesModel.createNew(change.city, change.code, change.post);
    } else if (typeOfChange === "UPDATE") {
      await postalCodesModel.edit(change.city, change.code, change.post);
    } else if (typeOfChange === "DELETE") {
      await postalCodesModel.deleteCode(change.code);
    }

    await pendingChangesPostalCodeModel.delete({ id: change.id });
    // To-do: handle the case when deleting from pending changes fails after the postal code has been updated/created/deleted

    return sendSuccess(res, {
      message: "Pending change approved successfully.",
    });
  }
}

const adminController = new AdminController();

export { adminController };
