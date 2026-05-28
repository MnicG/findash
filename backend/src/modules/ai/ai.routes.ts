import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as aiController from "./ai.controller";

const router = Router();

router.use(authMiddleware);

router.post("/portfolio/:clientId/analyze", aiController.analyzePortfolio);
router.post("/portfolio/:clientId/rebalance", aiController.rebalancePortfolio);
router.post("/news/summarize", aiController.summarizeNews);
router.post("/news/impact/:clientId", aiController.newsImpact);
router.post("/chat", aiController.chat);

export default router;