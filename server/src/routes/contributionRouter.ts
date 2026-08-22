import { Router } from "express";
const contributionRouter = Router();

import * as contributionController from "../controllers/contributionController.js";

contributionRouter.post("/universities", contributionController.createEntity);

contributionRouter.put("/universities", contributionController.editEntity);

contributionRouter.delete("/universities", contributionController.deleteEntity);

contributionRouter.get(
  "/pending-changes/universities",
  contributionController.getPendingChanges,
);

contributionRouter.delete(
  "/pending-changes/universities",
  contributionController.deletePendingChange,
);

export { contributionRouter };
