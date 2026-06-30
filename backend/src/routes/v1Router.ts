import { Router } from "express";
const v1Router = Router();

import { v1Controller } from "../controllers/v1Controller.js";
import { universityValidation } from "../validation/universityValidation.js";

v1Router.get("/", v1Controller.status);

v1Router.get("/universities", v1Controller.getUniversities);
v1Router.get(
  "/universities/search",
  universityValidation.searchUniversities,
  v1Controller.searchUniversities,
);
v1Router.get(
  "/universities/:id",
  universityValidation.getUniversityById,
  v1Controller.getUniversityById,
);
v1Router.get(
  "/study-programs/search",
  universityValidation.searchStudyPrograms,
  v1Controller.searchStudyPrograms,
);

export { v1Router };
