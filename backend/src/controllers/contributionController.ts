import { prisma } from "../db/prisma.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { logger } from "../utils/logger.js";
import * as contributionValidation from "../validation/contributionValidation.js";
import type { Request, Response } from "express";

async function createEntity(req: Request, res: Response) {
  const contribution = contributionValidation.createEntity(req.body);
  const { entityType, data } = contribution;
  const parentId = "parentId" in contribution ? contribution.parentId : null;

  try {
    if (!req.user) {
      sendError(res, {
        status: 401,
        message: "Authentication required: log in and try again.",
      });
      return;
    }
    const user = req.user;
    const userId = user.id;

    const result = await prisma.pendingChange.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        entityType,
        typeOfChange: "CREATE",
        parentId,
        data,
      },
    });

    sendSuccess(res, {
      status: 201,
      message: "Suggestion submitted. An admin will review it.",
      data: result,
    });
    return;
  } catch (err) {
    logger.error(err);
    sendError(res, {
      status: 500,
      message: "An error occurred while submitting the suggestion.",
    });
  }
}

async function editEntity(req: Request, res: Response) {
  if (!req.user) {
    sendError(res, {
      status: 401,
      message: "Authentication required: log in and try again.",
    });
    return;
  }
  const { entityType, targetId, data } = contributionValidation.editEntity(
    req.body,
  );

  try {
    const userId = req.user.id;

    const result = await prisma.pendingChange.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },

        entityType,
        typeOfChange: "UPDATE",
        targetId,
        data,
      },
    });

    sendSuccess(res, {
      status: 201,
      message: "Edit suggestion submitted. An admin will review it.",
      data: result,
    });
  } catch (err) {
    logger.error(err);
    sendError(res, {
      status: 500,
      message: "An error occurred while submitting the edit suggestion.",
    });
  }
}

async function deleteEntity(req: Request, res: Response) {
  if (!req.user) {
    sendError(res, {
      status: 401,
      message: "Authentication required: log in and try again.",
    });
    return;
  }
  const { entityType, targetId } = contributionValidation.deleteEntity(
    req.body,
  );

  try {
    const userId = req.user.id;

    const result = await prisma.pendingChange.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        entityType,
        typeOfChange: "DELETE",
        targetId,
        data: {},
      },
    });

    sendSuccess(res, {
      status: 201,
      message: "Deletion suggestion submitted. An admin will review it.",
      data: result,
    });
  } catch (err) {
    logger.error(err);
    sendError(res, {
      status: 500,
      message: "An error occurred while submitting the deletion suggestion.",
    });
  }
}

async function getPendingChanges(req: Request, res: Response) {
  if (!req.user) {
    sendError(res, {
      status: 401,
      message: "Authentication required: log in and try again.",
    });
    return;
  }
  const { id } = req.user;
  const pendingChanges = await prisma.pendingChange.findMany({
    where: { userId: id },
  });

  sendSuccess(res, {
    data: pendingChanges,
    message: "Pending changes retrieved successfully.",
  });
}

async function deletePendingChange(req: Request, res: Response) {
  if (!req.user) {
    sendError(res, {
      status: 401,
      message: "Authentication required: log in and try again.",
    });
    return;
  }
  const { id } = req.user;
  const { id: pendingChangeId } = contributionValidation.deletePendingChange(
    req.body,
  );

  const pendingChange = await prisma.pendingChange.findMany({
    where: { userId: id, id: pendingChangeId },
  });

  if (pendingChange.length === 0) {
    sendError(res, {
      status: 404,
      message: "Pending change not found.",
    });
    return;
  }

  await prisma.pendingChange.delete({
    where: { id: pendingChangeId },
  });

  sendSuccess(res, {
    message: "Pending change deleted successfully.",
  });
}

export {
  createEntity,
  editEntity,
  deleteEntity,
  getPendingChanges,
  deletePendingChange,
};
