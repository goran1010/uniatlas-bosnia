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

async function search(req: Request, res: Response) {
  const { searchTerm } = universityValidation.searchQuery(req.query);

  const contains = {
    contains: searchTerm,
    mode: "insensitive",
  } as const;

  const [universities, faculties, studyPrograms, subjects] = await Promise.all([
    prisma.university.findMany({
      where: {
        OR: [{ name: contains }, { city: contains }, { acronym: contains }],
      },
    }),
    prisma.faculty.findMany({
      where: {
        OR: [{ name: contains }, { city: contains }],
      },
      include: {
        university: true,
      },
    }),
    prisma.studyProgram.findMany({
      where: {
        name: contains,
      },
      include: {
        faculty: {
          include: {
            university: true,
          },
        },
      },
    }),
    prisma.subject.findMany({
      where: {
        name: contains,
      },
      include: {
        studyProgram: {
          include: {
            faculty: {
              include: {
                university: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalResults =
    universities.length +
    faculties.length +
    studyPrograms.length +
    subjects.length;

  if (totalResults > 0) {
    sendSuccess(res, {
      message: "Search results retrieved successfully.",
      data: { universities, faculties, studyPrograms, subjects },
    });
    return;
  }

  sendError(res, {
    status: 404,
    message: "No results found matching your search.",
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

export { status, getUniversities, search, getUniversityById };
