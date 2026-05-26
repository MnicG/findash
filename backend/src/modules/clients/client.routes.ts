import { Router } from "express";
import { clientController } from "./client.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createClientSchema, updateClientSchema } from "./client.schema";

const router = Router();

router.use(authMiddleware);

router.get("/summary", clientController.getSummary);   // must be before /:id
router.get("/", clientController.getAll);
router.get("/:id", clientController.getById);
router.post("/", validate(createClientSchema), clientController.create);
router.put("/:id", validate(updateClientSchema), clientController.update);
router.delete("/:id", clientController.delete);

router.get("/:id/positions", clientController.getPositions);
router.post("/:id/positions", clientController.addPosition);
router.delete("/:id/positions/:positionId", clientController.removePosition);

router.get("/:id/transactions", clientController.getTransactions);

export default router;