// src/routes/secteur.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import SecteurController from "../controllers/secteurController";
import {
  createSecteurSchema,
  updateSecteurSchema,
} from "../validations/geoValidation";

const router = Router();

// POST /t/:slug/secteurs
router.post(
  "/t/:slug/secteurs",
  tenantFromSlug, // injecte tenantId
  authMiddleware, // vérifie JWT + tenant
  validate(createSecteurSchema),
  SecteurController.create
);

// GET /t/:slug/secteurs
router.get(
  "/t/:slug/secteurs",
  tenantFromSlug,
  authMiddleware,
  SecteurController.list
);

// GET /t/:slug/secteurs/:id
router.get(
  "/t/:slug/secteurs/:id",
  tenantFromSlug,
  authMiddleware,
  SecteurController.get
);

// PUT /t/:slug/secteurs/:id
router.put(
  "/t/:slug/secteurs/:id",
  tenantFromSlug,
  authMiddleware,
  validate(updateSecteurSchema),
  SecteurController.update
);

// DELETE /t/:slug/secteurs/:id
router.delete(
  "/t/:slug/secteurs/:id",
  tenantFromSlug,
  authMiddleware,
  SecteurController.remove
);

export default router;
