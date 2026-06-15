function loadEnv() {
  try {
    process.loadEnvFile();
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

loadEnv();

const env = Object.freeze({
  DATABASE_URL: process.env.DATABASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  BACKEND_URL: process.env.BACKEND_URL,
  PORT: process.env.PORT,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
});

function envCheck(env) {
  const required = [
    "DATABASE_URL",
    "FRONTEND_URL",
    "BACKEND_URL",
    "PORT",
    "RESEND_API_KEY",
    "COOKIE_SECRET",
    "NODE_ENV",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_CALLBACK_URL",
  ];

  if (env.NODE_ENV !== "production") {
    required.push("TEST_DATABASE_URL");
  }

  const missingVars = required.filter((key) => !env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }
}

envCheck(env);

const {
  DATABASE_URL,
  FRONTEND_URL,
  BACKEND_URL,
  PORT,
  RESEND_API_KEY,
  COOKIE_SECRET,
  NODE_ENV,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  TEST_DATABASE_URL,
} = env;

export {
  env,
  envCheck,
  DATABASE_URL,
  FRONTEND_URL,
  BACKEND_URL,
  PORT,
  RESEND_API_KEY,
  COOKIE_SECRET,
  NODE_ENV,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  TEST_DATABASE_URL,
};
