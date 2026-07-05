import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GitHubStrategy } from "passport-github2";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";
import { env } from "./env.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

import type { DoneCallback } from "passport";

const runAsync = (operation: () => Promise<void>): void => {
  void operation();
};

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    runAsync(async () => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) {
          done(null, false, { message: "Incorrect email or password" });
          return;
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          done(null, false, { message: "Incorrect email or password" });
          return;
        }

        const safeUser = sanitizeUser(user);
        done(null, safeUser);
        return;
      } catch (err) {
        done(err);
        return;
      }
    });
  }),
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
    (
      _accessToken: string,
      _refreshToken: string,
      profile: GitHubProfile,
      done: DoneCallback,
    ) => {
      runAsync(async () => {
        try {
          let user = await prisma.user.findUnique({
            where: { githubId: profile.id },
          });
          if (user) {
            const safeUser = sanitizeUser(user);
            done(null, safeUser);
            return;
          }

          const primaryEmail = profile.emails?.[0]?.value;
          if (!primaryEmail) {
            done(null, false);
            return;
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
              done(null, safeUser);
              return;
            }
          }

          user = await prisma.user.create({
            data: {
              email: primaryEmail,
              githubId: profile.id,
            },
          });
          const safeUser = sanitizeUser(user);

          done(null, safeUser);
          return;
        } catch (err) {
          done(err);
          return;
        }
      });
    },
  ),
);

passport.serializeUser((user, done) => {
  try {
    done(null, user.id);
  } catch (err) {
    done(err);
  }
});

passport.deserializeUser((id: string, done) => {
  runAsync(async () => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      const safeUser = user ? sanitizeUser(user) : null;
      done(null, safeUser);
    } catch (err) {
      done(err);
    }
  });
});

export { passport };
