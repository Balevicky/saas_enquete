import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import VillageController from "../controllers/villageController";
import {
  createVillageSchema,
  updateVillageSchema,
} from "../validations/geoValidation";
import { validate } from "../middlewares/validateMiddleware";
const router = Router();

// Villages
router.post(
  "/villages",
  authMiddleware,
  validate(createVillageSchema),
  VillageController.create
);
router.get("/villages", authMiddleware, VillageController.list);
router.get("/villages/:id", authMiddleware, VillageController.get);
router.put(
  "/villages/:id",
  authMiddleware,
  validate(updateVillageSchema),
  VillageController.update
);
router.delete("/villages/:id", authMiddleware, VillageController.remove);

export default router;
