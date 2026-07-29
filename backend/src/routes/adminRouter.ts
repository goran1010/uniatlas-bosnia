import { Router } from "express";
const adminRouter = Router();

import * as adminController from "../controllers/adminController.js";

adminRouter.get("/pending-changes", adminController.getPendingChanges);

adminRouter.delete(
  "/decline-pending-change",
  adminController.declinePendingChange,
);

adminRouter.post(
  "/approve-pending-change",
  adminController.approvePendingChange,
);

export { adminRouter };
