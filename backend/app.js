import express from "express";
const app = express();
import cors from "cors";

import "./config/envCheck.js";

import { sessionMiddleware } from "./config/sessionMiddleware.js";
import { passport } from "./config/passport.js";

import helmet from "helmet";
import * as rateLimiter from "./utils/rateLimiter.js";

import { csrfSync } from "csrf-sync";
import { csrfRouter } from "./routes/csrfRouter.js";
const { csrfSynchronisedProtection } = csrfSync();

import compression from "compression";

import { logger } from "./utils/logger.js";

import { sendError } from "./utils/response.js";

import { apiRouter } from "./routes/apiRouter.js";
import { authRouter } from "./routes/authRouter.js";
import { usersRouter } from "./routes/usersRouter.js";

const FRONTEND_URL = process.env.FRONTEND_URL;

// Trust first proxy (required for Koyeb)
app.set("trust proxy", 1);

app.use(rateLimiter.global);

// Log every request made to the server
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} ${req.ip}`);
  next();
});

app.use(helmet());
app.use(compression());

// Public API routes
app.use("/api", cors(), rateLimiter.api, apiRouter);
// -----------------

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware);
app.use(passport.session());

app.use(csrfRouter);

app.use("/auth", rateLimiter.auth, authRouter);
app.use("/users", rateLimiter.users, csrfSynchronisedProtection, usersRouter);

app.use((req, res) => {
  return sendError(res, {
    status: 404,
    message: "Route not found: check the URL and HTTP method.",
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err);

  return sendError(res, {
    status: err.statusCode || 500,
    message: "Server error: please try again later.",
  });
});

export { app };
