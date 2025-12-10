import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import RegionController from "../controllers/regionController";
import { validate } from "../middlewares/validateMiddleware";
import {
  createRegionSchema,
  updateRegionSchema,
} from "../validations/geoValidation";

const router = Router();
// Régions
router.post(
  "/regions",
  authMiddleware,
  validate(createRegionSchema),
  RegionController.create
);
router.get("/regions", authMiddleware, RegionController.list);
router.get("/regions/:id", authMiddleware, RegionController.get);
router.put(
  "/regions/:id",
  authMiddleware,
  validate(updateRegionSchema),
  RegionController.update
);
router.delete("/regions/:id", authMiddleware, RegionController.remove);

export default router;
