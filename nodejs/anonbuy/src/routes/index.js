import { Router } from "express";
import items from "../api/items/items.routes.js";
import orders from "../api/orders/orders.routes.js";
import image from "../api/image/image.routes.js";
import wallet from "../api/wallet/wallet.routes.js";

const router = Router();
router.use("/items", items);
router.use("/order", orders);
router.use("/image", image);
router.use("/wallet", wallet);

export default router;
