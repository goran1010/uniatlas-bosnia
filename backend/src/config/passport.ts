import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GitHubStrategy } from "passport-github2";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";
import { env } from "./env.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

import type { DoneCallback } from "passport";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password)
          return done(null, false, { message: "Incorrect email or password" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        const safeUser = sanitizeUser(user);
        return done(null, safeUser);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

interface GitHubProfile {
  id: string;
  emails?: { value: string }[];
}

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: env.GITHUB_CALLBACK_URL,
      scope: ["user:email"],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: GitHubProfile,
      done: DoneCallback,
    ) => {
      try {
        let user = await prisma.user.findUnique({
          where: { githubId: profile.id },
        });
        if (user) {
          const safeUser = sanitizeUser(user);
          return done(null, safeUser);
        }

        const primaryEmail = profile.emails?.[0]?.value;
        if (!primaryEmail) {
          return done(null, false);
        }

        if (primaryEmail) {
          user = await prisma.user.findUnique({
            where: { email: primaryEmail },
          });
          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { githubId: profile.id },
            });
            const safeUser = sanitizeUser(user);
            return done(null, safeUser);
          }
        }

        user = await prisma.user.create({
          data: {
            email: primaryEmail,
            githubId: profile.id,
          },
        });
        const safeUser = sanitizeUser(user);

        return done(null, safeUser);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  try {
    done(null, user["id"]);
  } catch (err) {
    done(err);
  }
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    const safeUser = user ? sanitizeUser(user) : null;
    done(null, safeUser);
  } catch (err) {
    done(err);
  }
});

export { passport };
