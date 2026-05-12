import { Router } from "express";
const usersRouter = Router();
import { usersController } from "../controllers/usersController.js";
import { adminRouter } from "./adminRouter.js";
import { isAdmin } from "../auth/isAdmin.js";
import { contributionRouter } from "./contributionRouter.js";

usersRouter.post("/logout", usersController.logout);

usersRouter.use("/admin", isAdmin, adminRouter);

usersRouter.use("/contribution", contributionRouter);

export { usersRouter };
