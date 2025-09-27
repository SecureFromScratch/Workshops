import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import internalRouter from "./routes/internal.routes.js";
import ordersRouter from "./routes/orders.routes.js";
 
 



const app = express();
app.use(morgan("dev"));                 // ➕ logs each request
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));


app.get("/health", (_, res) => res.json({ status: "ok" }));


app.use("/internal", internalRouter);

+app.use("/api/v1", routes);

// one error handler, last
app.use(errorHandler);
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error("ERROR:", err.message);
  if (err.stack) console.error(err.stack);
  const status =
    err.statusCode ??
    (err.name === "ZodError" ? 400 : 500);
  res.status(status).json({ error: err.message });
});

export default app;
