import { app } from "./app.js";
import { PORT } from "./config/env.js";

const server = app.listen(PORT, (error: unknown) => {
  if (error) throw error;
  // eslint-disable-next-line no-console
  console.log(`App started at port: ${PORT}`);
});

let shuttingDown = false;

type GracefulShutdownSignal =
  | "SIGTERM"
  | "SIGINT"
  | "uncaughtException"
  | "unhandledRejection";

function gracefulShutdown(signal: GracefulShutdownSignal, exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.warn(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.warn("Process terminated");
    process.exit(exitCode);
  });

  setTimeout(() => {
    console.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM", 0);
});

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT", 0);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  gracefulShutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  gracefulShutdown("unhandledRejection", 1);
});
