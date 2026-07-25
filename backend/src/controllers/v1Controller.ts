import { prisma } from "../db/prisma.js";
import { sendError, sendSuccess } from "../utils/response.js";

import type { Request, Response } from "express";
import * as universityValidation from "../validation/universityValidation.js";

function status(_req: Request, res: Response) {
  sendSuccess(res, {
    data: {
      status: "ok",
    },
    message: "API v1 server is running",
  });
}

async function getUniversities(_req: Request, res: Response) {
  const universities = await prisma.university.findMany();
  sendSuccess(res, {
    message: "Universities retrieved successfully.",
    data: universities,
  });
}

async function searchUniversities(req: Request, res: Response) {
  const { searchTerm } = universityValidation.searchQuery(req.query);

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
}

async function getUniversityById(req: Request, res: Response) {
  const { id } = universityValidation.getUniversityById(req.params);

  const university = await prisma.university.findUnique({
    where: {
      id,
    },
    include: {
      faculties: {
        include: {
          studyPrograms: {
            include: {
              subjects: true,
            },
          },
        },
      },
    },
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
}

async function searchStudyPrograms(req: Request, res: Response) {
  const { searchTerm } = universityValidation.searchQuery(req.query);

  const result = await prisma.studyProgram.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    include: {
      faculty: {
        include: {
          university: true,
        },
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
}

export {
  status,
  getUniversities,
  searchUniversities,
  getUniversityById,
  searchStudyPrograms,
};
