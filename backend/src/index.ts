import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello, World! 1000");
});

app.listen(PORT, (error?: Error) => {
  if (error) throw error;
  // eslint-disable-next-line no-console
  console.log(`App started at port: ${PORT}`);
});
