import { universitiesModel } from "../models/universitiesModel.js";
import { matchedData } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";

import type { Request, Response } from "express";

class V1Controller {
  status(_req: Request, res: Response) {
    return sendSuccess(res, {
      data: {
        status: "ok",
      },
      message: "API v1 server is running",
    });
  }

  async getUniversities(_req: Request, res: Response) {
    const universities = await universitiesModel.getAll();
    return sendSuccess(res, {
      message: "Universities retrieved successfully.",
      data: universities,
    });
  }

  async searchUniversities(req: Request, res: Response) {
    const { searchTerm } = matchedData(req);
    const result = await universitiesModel.searchUniversities(searchTerm);

    if (result.length > 0) {
      return sendSuccess(res, {
        message: "Universities retrieved successfully.",
        data: result,
      });
    }

    return sendError(res, {
      status: 404,
      message: "No universities found matching your search.",
    });
  }

  async getUniversityById(req: Request, res: Response) {
    const id = Number(req.params["id"]);

    if (!Number.isInteger(id) || id < 1) {
      return sendError(res, {
        status: 400,
        message: "Invalid university ID.",
      });
    }

    const university = await universitiesModel.getById(id);

    if (!university) {
      return sendError(res, {
        status: 404,
        message: "University not found.",
      });
    }

    return sendSuccess(res, {
      message: "University retrieved successfully.",
      data: university,
    });
  }

  async searchStudyPrograms(req: Request, res: Response) {
    const { searchTerm } = matchedData(req);
    const result = await universitiesModel.searchStudyPrograms(searchTerm);

    if (result.length > 0) {
      return sendSuccess(res, {
        message: "Study programs retrieved successfully.",
        data: result,
      });
    }

    return sendError(res, {
      status: 404,
      message: "No study programs found matching your search.",
    });
  }
}

const v1Controller = new V1Controller();

export { v1Controller };
