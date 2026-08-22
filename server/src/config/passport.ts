import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

import { prisma } from "../db/prisma.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { env } from "./env.js";

import type { DoneCallback } from "passport";

interface GitHubProfile {
  id: string;
  emails?: { value: string }[];
}

function runAsync(operation: () => Promise<void>): void {
  void operation();
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    (email, password, done) => {
      runAsync(async () => {
        try {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user?.password) {
            done(null, false, {
              message: "Incorrect email or password",
            });
            return;
          }

          const passwordMatches = await bcrypt.compare(password, user.password);

          if (!passwordMatches) {
            done(null, false, {
              message: "Incorrect email or password",
            });
            return;
          }

          done(null, sanitizeUser(user));
        } catch (error: unknown) {
          done(error);
        }
      });
    },
  ),
);

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
          const githubUser = await prisma.user.findUnique({
            where: {
              githubId: profile.id,
            },
          });

          if (githubUser) {
            done(null, sanitizeUser(githubUser));
            return;
          }

          const primaryEmail = profile.emails?.[0]?.value;

          if (!primaryEmail) {
            done(null, false);
            return;
          }

          const emailUser = await prisma.user.findUnique({
            where: {
              email: primaryEmail,
            },
          });

          if (emailUser) {
            const updatedUser = await prisma.user.update({
              where: {
                id: emailUser.id,
              },
              data: {
                githubId: profile.id,
              },
            });

            done(null, sanitizeUser(updatedUser));
            return;
          }

          const createdUser = await prisma.user.create({
            data: {
              email: primaryEmail,
              githubId: profile.id,
            },
          });

          done(null, sanitizeUser(createdUser));
        } catch (error: unknown) {
          done(error);
        }
      });
    },
  ),
);

passport.serializeUser<string>((user, done) => {
  try {
    done(null, user.id);
  } catch (error: unknown) {
    done(error);
  }
});

passport.deserializeUser<string>((id, done) => {
  runAsync(async () => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        done(null, false);
        return;
      }

      done(null, sanitizeUser(user));
    } catch (error: unknown) {
      done(error);
    }
  });
});

export { passport };
