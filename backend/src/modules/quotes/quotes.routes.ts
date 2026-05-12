import { Router } from "express";
import { quotesController } from "./quotes.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/:from/:to", quotesController.getRate);

export default router;