import { Router } from "express";
const contributionRouter = Router();

import { contributionController } from "../controllers/contributionController.js";
import { contributionValidation } from "../validation/contributionValidation.js";

contributionRouter.get(
  "/pending-changes/postal-codes",
  contributionController.getPendingChanges,
);

contributionRouter.delete(
  "/pending-changes/postal-codes",
  contributionController.deletePendingChange,
);

contributionRouter.post(
  "/postal-codes",
  contributionValidation.createPostalCode,
  contributionController.createPostalCode,
);

contributionRouter.put(
  "/postal-codes",
  contributionValidation.editPostalCode,
  contributionController.editPostalCode,
);

contributionRouter.delete(
  "/postal-codes",
  contributionValidation.deletePostalCode,
  contributionController.deletePostalCode,
);

export { contributionRouter };
