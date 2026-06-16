import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from "../db/prisma.js";
import { COOKIE_SECRET, NODE_ENV } from "./env.js";

const NUMBER_OF_DAYS = 30;
const IS_PRODUCTION = NODE_ENV === "production";

const sessionMiddleware = expressSession({
  name: "sessionId",
  proxy: IS_PRODUCTION,
  cookie: {
    maxAge: NUMBER_OF_DAYS * 24 * 60 * 60 * 1000,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    httpOnly: true,
    path: "/",
  },
  secret: COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
});

export { sessionMiddleware };
