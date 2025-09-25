import { Router } from "express";
import items from "./items.routes.js";
import users from "./users.routes.js";
import orders from "./orders.routes.js";

const router = Router();
router.use("/items", items);
router.use("/users", users);
router.use("/orders", orders);

export default router;
