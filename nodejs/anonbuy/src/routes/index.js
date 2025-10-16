import { Router } from "express";
import items from "./items.routes.js";
import users from "./users.routes.js";
import orders from "./orders.routes.js";
import image from "./image.routes.js";
import giftcard from "./giftcard.routes.js";

const router = Router();
router.use("/items", items);
router.use("/users", users);
router.use("/order", orders);
router.use("/image", image);
router.use("/giftcard", giftcard);

export default router;
