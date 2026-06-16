class Env {
  readonly DATABASE_URL: string;
  readonly FRONTEND_URL: string;
  readonly BACKEND_URL: string;
  readonly PORT: string;
  readonly RESEND_API_KEY: string;
  readonly COOKIE_SECRET: string;
  readonly NODE_ENV: string;
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
  readonly GITHUB_CALLBACK_URL: string;
  readonly TEST_DATABASE_URL: string;

  constructor() {
    this.DATABASE_URL = Env.#getEnv("DATABASE_URL");
    this.FRONTEND_URL = Env.#getEnv("FRONTEND_URL");
    this.BACKEND_URL = Env.#getEnv("BACKEND_URL");
    this.PORT = Env.#getEnv("PORT");
    this.RESEND_API_KEY = Env.#getEnv("RESEND_API_KEY");
    this.COOKIE_SECRET = Env.#getEnv("COOKIE_SECRET");
    this.NODE_ENV = Env.#getEnv("NODE_ENV");
    this.GITHUB_CLIENT_ID = Env.#getEnv("GITHUB_CLIENT_ID");
    this.GITHUB_CLIENT_SECRET = Env.#getEnv("GITHUB_CLIENT_SECRET");
    this.GITHUB_CALLBACK_URL = Env.#getEnv("GITHUB_CALLBACK_URL");
    this.TEST_DATABASE_URL = Env.#getEnv("TEST_DATABASE_URL");
  }

  static #getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
  }
}

const env = new Env();

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
