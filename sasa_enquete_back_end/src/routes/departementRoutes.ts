import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import DepartementController from "../controllers/departementController";

import {
  createDepartementSchema,
  updateDepartementSchema,
} from "../validations/geoValidation";

const router = Router();

// Départements
router.post(
  "/departements",
  authMiddleware,
  validate(createDepartementSchema),
  DepartementController.create
);
router.get("/departements", authMiddleware, DepartementController.list);
router.get("/departements/:id", authMiddleware, DepartementController.get);
router.put(
  "/departements/:id",
  authMiddleware,
  validate(updateDepartementSchema),
  DepartementController.update
);
router.delete(
  "/departements/:id",
  authMiddleware,
  DepartementController.remove
);

export default router;
