import { prisma } from "../db/prisma.js";
import { matchedData } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";

import type { Request, Response } from "express";

interface SearchInput {
  searchTerm: string;
}

interface UniversityIdInput {
  id: number;
}

class V1Controller {
  status = (_req: Request, res: Response) => {
    sendSuccess(res, {
      data: {
        status: "ok",
      },
      message: "API v1 server is running",
    });
  };

  getUniversities = async (_req: Request, res: Response) => {
    const universities = await prisma.university.findMany();
    sendSuccess(res, {
      message: "Universities retrieved successfully.",
      data: universities,
    });
  };

  searchUniversities = async (req: Request, res: Response) => {
    const { searchTerm } = matchedData<SearchInput>(req);
    const result = await prisma.university.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            city: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            acronym: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (result.length > 0) {
      sendSuccess(res, {
        message: "Universities retrieved successfully.",
        data: result,
      });
      return;
    }

    sendError(res, {
      status: 404,
      message: "No universities found matching your search.",
    });
  };

  getUniversityById = async (req: Request, res: Response) => {
    const { id } = matchedData<UniversityIdInput>(req);

    const university = await prisma.university.findUnique({
      where: { id },
    });

    if (!university) {
      sendError(res, {
        status: 404,
        message: "University not found.",
      });
      return;
    }

    sendSuccess(res, {
      message: "University retrieved successfully.",
      data: university,
    });
  };

  searchStudyPrograms = async (req: Request, res: Response) => {
    const { searchTerm } = matchedData<SearchInput>(req);
    const result = await prisma.studyProgram.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    });

    if (result.length > 0) {
      sendSuccess(res, {
        message: "Study programs retrieved successfully.",
        data: result,
      });
      return;
    }

    sendError(res, {
      status: 404,
      message: "No study programs found matching your search.",
    });
  };
}

const v1Controller = new V1Controller();

export { v1Controller };
