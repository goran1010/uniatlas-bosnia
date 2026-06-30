import { Router } from "express";
const contributionRouter = Router();

import { contributionController } from "../controllers/contributionController.js";
import { contributionValidation } from "../validation/contributionValidation.js";

contributionRouter.post(
  "/universities",
  contributionValidation.createEntity,
  contributionController.createEntity,
);

contributionRouter.put(
  "/universities",
  contributionValidation.editEntity,
  contributionController.editEntity,
);

contributionRouter.delete(
  "/universities",
  contributionValidation.deleteEntity,
  contributionController.deleteEntity,
);

contributionRouter.get(
  "/pending-changes/universities",
  contributionController.getPendingChanges,
);

contributionRouter.delete(
  "/pending-changes/universities",
  contributionValidation.deletePendingChange,
  contributionController.deletePendingChange,
);

export { contributionRouter };
