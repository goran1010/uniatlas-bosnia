import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GitHubStrategy } from "passport-github2";
import bcrypt from "bcryptjs";
import { usersModel } from "../models/usersModel.js";
import {
  GITHUB_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from "./env.js";

import type { DoneCallback } from "passport";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await usersModel.findOne({ email });
        if (!user || !user.password)
          return done(null, false, { message: "Incorrect email or password" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        return done(null, user);
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
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ["user:email"],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: GitHubProfile,
      done: DoneCallback,
    ) => {
      try {
        let user = await usersModel.findOne({
          githubId: profile.id.toString(),
        });
        if (user) return done(null, user);

        const primaryEmail = profile.emails?.[0]?.value;
        if (!primaryEmail) {
          return done(null, false);
        }

        if (primaryEmail) {
          user = await usersModel.findOne({ email: primaryEmail });
          if (user) {
            user = await usersModel.update(
              { id: user.id },
              { githubId: profile.id.toString() },
            );
            return done(null, user);
          }
        }

        user = await usersModel.create({
          email: primaryEmail,
          githubId: profile.id.toString(),
        });
        const safeUser = {
          id: user.id,
          email: user.email,
          role: user.role,
          githubId: user.githubId,
        };

        return done(null, safeUser);
      } catch (err) {
        return done(err);
      }
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

passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersModel.findOne({ id });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export { passport };
