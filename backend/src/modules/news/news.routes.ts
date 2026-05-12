import { Router } from "express";
import { newsController } from "./news.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", newsController.getNews);
router.get("/top", newsController.getTopNews);

export default router;