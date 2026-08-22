import rateLimit from "express-rate-limit";
const MINUTE = 60 * 1000;

const global = rateLimit({
  windowMs: 15 * MINUTE,
  max: 500,
  message: {
    error: {
      message: "Too many requests. Please wait 15 minutes, then try again.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const auth = rateLimit({
  windowMs: 15 * MINUTE,
  max: 15,
  message: {
    error: {
      message:
        "Too many login attempts. Please wait 15 minutes, then try again.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const api = rateLimit({
  windowMs: 15 * MINUTE,
  max: 100,
  message: {
    error: {
      message: "Too many API requests. Please wait 15 minutes, then try again.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const users = rateLimit({
  windowMs: 15 * MINUTE,
  max: 100,
  message: {
    error: {
      message: "Too many requests. Please wait 15 minutes, then try again.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { global, auth, api, users };
