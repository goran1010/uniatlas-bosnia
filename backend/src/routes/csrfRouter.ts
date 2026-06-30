import express from "express";
import { csrfSync } from "csrf-sync";
import { sendSuccess } from "../utils/response.js";
const { generateToken } = csrfSync();

const csrfRouter = express.Router();

csrfRouter.get("/csrf-token", (req, res) => {
  return sendSuccess(res, {
    message: "CSRF token generated successfully",
    data: generateToken(req),
  });
});

export { csrfRouter };
