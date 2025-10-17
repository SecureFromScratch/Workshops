import { Router } from "express";
import { localOnly } from "../../middlewares/localOnly.js";
import { topSecret } from "./secret.controller.js";

const r = Router();
r.get("/top-secret", localOnly, topSecret);

export default r;
