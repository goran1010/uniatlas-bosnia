import { Router } from "express";
const healthRouter = Router();

import * as healthController from "../controllers/healthController.js";

healthRouter.get("/", healthController.status);

export { healthRouter };
