import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import internalRouter from "./routes/internal.routes.js";
//import cookieParser from "cookie-parser";

const app = express();
app.use(morgan("dev"));                 // ➕ logs each request
//app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/api/v1", routes);
app.use(errorHandler);

// ➕ show Multer/other errors in terminal and return JSON
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  if (err.stack) console.error(err.stack);
  res.status(400).json({ error: err.message });
});

app.use("/internal", internalRouter);
//app.use("/orders", ordersRouter);

export default app;
