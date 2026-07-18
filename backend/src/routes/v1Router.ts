import { Router } from "express";
const v1Router = Router();

import * as universityController from "../controllers/v1Controller.js";

v1Router.get("/", universityController.status);

v1Router.get("/universities", universityController.getUniversities);

v1Router.get("/universities/search", universityController.searchUniversities);

v1Router.get("/universities/:id", universityController.getUniversityById);

v1Router.get(
  "/study-programs/search",
  universityController.searchStudyPrograms,
);

export { v1Router };
