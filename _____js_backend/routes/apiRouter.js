import { Router } from "express";
const apiRouter = Router();

import { v1Router } from "./v1Router.js";
import { apiController } from "../controllers/apiController.js";

apiRouter.get("/", apiController.status);

apiRouter.use("/v1", v1Router);

export { apiRouter };
