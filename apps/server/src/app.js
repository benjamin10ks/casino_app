import express from "express";
import cors from "cors";

import { notFound } from "./middleware/notFound.middleware.js";

import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: [process.env.VITE_SERVER_URL || "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api", routes);

app.use(notFound);

export default app;
