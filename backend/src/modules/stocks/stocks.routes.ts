import { Router } from "express";
import { stocksController } from "./stocks.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get('/search', stocksController.search); 
router.get("/:symbol", stocksController.getQuote);
router.get("/:symbol/history", stocksController.getHistory);

export default router;