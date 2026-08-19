import { prisma } from "../db/prisma.js";
import * as transactionModel from "../models/transactionModel.js";
import { sendError, sendSuccess } from "../utils/response.js";
import * as adminValidation from "../validation/adminValidation.js";

import type { Request, Response } from "express";

async function getPendingChanges(_req: Request, res: Response) {
  const pendingChanges = await prisma.pendingChange.findMany({
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });

  // For UPDATE/DELETE changes, batch-fetch the current entity data so the
  // admin can see what is being changed or removed.
  const targetIds = {
    UNIVERSITY: [] as number[],
    FACULTY: [] as number[],
    STUDY_PROGRAM: [] as number[],
    SUBJECT: [] as number[],
  };

  for (const pc of pendingChanges) {
    if (pc.targetId != null && pc.entityType in targetIds) {
      targetIds[pc.entityType].push(pc.targetId);
    }
  }

  const [universities, faculties, studyPrograms, subjects] = await Promise.all([
    targetIds.UNIVERSITY.length > 0
      ? prisma.university.findMany({
          where: { id: { in: targetIds.UNIVERSITY } },
          select: {
            id: true,
            name: true,
            city: true,
            entity: true,
            ownership: true,
            foundedYear: true,
            website: true,
          },
        })
      : [],
    targetIds.FACULTY.length > 0
      ? prisma.faculty.findMany({
          where: { id: { in: targetIds.FACULTY } },
          select: { id: true, name: true, city: true, website: true },
        })
      : [],
    targetIds.STUDY_PROGRAM.length > 0
      ? prisma.studyProgram.findMany({
          where: { id: { in: targetIds.STUDY_PROGRAM } },
          select: {
            id: true,
            name: true,
            cycle: true,
            durationYears: true,
            ects: true,
            language: true,
          },
        })
      : [],
    targetIds.SUBJECT.length > 0
      ? prisma.subject.findMany({
          where: { id: { in: targetIds.SUBJECT } },
          select: {
            id: true,
            name: true,
            semester: true,
            ects: true,
            type: true,
          },
        })
      : [],
  ]);

  const entityMaps = {
    UNIVERSITY: new Map(universities.map((e) => [e.id, e])),
    FACULTY: new Map(faculties.map((e) => [e.id, e])),
    STUDY_PROGRAM: new Map(studyPrograms.map((e) => [e.id, e])),
    SUBJECT: new Map(subjects.map((e) => [e.id, e])),
  };

  const enriched = pendingChanges.map((pc) => ({
    ...pc,
    currentEntity:
      pc.targetId != null && pc.entityType in entityMaps
        ? (entityMaps[pc.entityType].get(pc.targetId) ?? null)
        : null,
  }));

  sendSuccess(res, {
    data: enriched,
    message: "Pending changes retrieved successfully.",
  });
}

async function declinePendingChange(req: Request, res: Response) {
  const { id } = adminValidation.declinePendingChange(req.body);

  await prisma.pendingChange.delete({ where: { id } });

  sendSuccess(res, {
    message: "Pending change declined successfully.",
  });
}

async function approvePendingChange(req: Request, res: Response) {
  const { id } = adminValidation.approvePendingChange(req.body);

  const wasApplied = await transactionModel.approvePendingChange({
    id,
  });

  if (!wasApplied) {
    sendError(res, {
      status: 404,
      message: "Pending change not found.",
    });
    return;
  }

  sendSuccess(res, {
    message: "Pending change approved successfully.",
  });
}

async function getAdminRequests(_req: Request, res: Response) {
  const adminRequests = await prisma.user.findMany({
    where: {
      adminRequestedAt: { not: null },
      role: "USER",
    },
    select: {
      id: true,
      email: true,
      adminRequestedAt: true,
    },
    orderBy: { adminRequestedAt: "asc" },
  });

  sendSuccess(res, {
    data: adminRequests,
    message: "Admin requests retrieved successfully.",
  });
}

async function approveAdminRequest(req: Request, res: Response) {
  const { id } = adminValidation.approveAdminRequest(req.body);

  // updateMany so a missing user or an already-handled request is a clean 404
  const { count } = await prisma.user.updateMany({
    where: { id, adminRequestedAt: { not: null } },
    data: { role: "ADMIN", adminRequestedAt: null },
  });

  if (count === 0) {
    sendError(res, {
      status: 404,
      message: "Admin request not found.",
    });
    return;
  }

  sendSuccess(res, {
    message: "Admin request approved successfully.",
  });
}

async function declineAdminRequest(req: Request, res: Response) {
  const { id } = adminValidation.declineAdminRequest(req.body);

  const { count } = await prisma.user.updateMany({
    where: { id, adminRequestedAt: { not: null } },
    data: { adminRequestedAt: null },
  });

  if (count === 0) {
    sendError(res, {
      status: 404,
      message: "Admin request not found.",
    });
    return;
  }

  sendSuccess(res, {
    message: "Admin request declined successfully.",
  });
}

export {
  getPendingChanges,
  declinePendingChange,
  approvePendingChange,
  getAdminRequests,
  approveAdminRequest,
  declineAdminRequest,
};
