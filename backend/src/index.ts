import express from "express";
import { DATABASE_URL } from "#config/env.js";

const app = express();
const PORT = 3000;

app.get("/", (_req, res) => {
  res.send(`Hello, World! 1000 ${DATABASE_URL}`);
});

app.listen(PORT, (error?: Error) => {
  if (error) throw error;
  // eslint-disable-next-line no-console
  console.log(`App started at port: ${PORT}`);
});
