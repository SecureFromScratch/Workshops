import express from "express";
import app from "./app.js";
import { PORT, PUBLIC_DIR } from "./config/env.js";

console.log("Public dir at", PUBLIC_DIR)
app.use(express.static(PUBLIC_DIR))

app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
