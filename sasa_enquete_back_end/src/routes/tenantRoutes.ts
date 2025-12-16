// src/routes/tenantRoute.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import TenantController from "../controllers/tenantController";
import { validate } from "../middlewares/validateMiddleware";
import {
  createTenantSchema,
  updateGeneralSchema,
  updateBrandingSchema,
} from "../validations/tenantValidation";

import { requireRole } from "../middlewares/roleMiddleware"; // nouveau middleware RBAC

const router = Router();

// ======================
// GET tenant settings
// ======================
router.get(
  "/t/:slug/settings",
  authMiddleware,
  tenantFromSlug,
  TenantController.getSettings
);

// ======================
// UPDATE General Settings
// only OWNER and ADMIN
// ======================
router.put(
  "/t/:slug/settings/general",
  authMiddleware,
  tenantFromSlug,
  // requireRole(["OWNER", "ADMIN"]),
  requireRole(["OWNER", "ADMIN"]),
  validate(updateGeneralSchema),
  TenantController.updateGeneral
);

// ======================
// UPDATE Branding Settings
// only OWNER and ADMIN
// ======================
router.put(
  "/t/:slug/settings/branding",
  authMiddleware,
  tenantFromSlug,
  requireRole(["OWNER", "ADMIN"]),
  validate(updateBrandingSchema),
  TenantController.updateBranding
);

// ======================
// ADMIN: CREATE tenant
// ======================
router.post(
  "/t/:slug/create",
  authMiddleware,
  tenantFromSlug,
  requireRole(["OWNER", "ADMIN"]),
  validate(createTenantSchema),
  TenantController.createTenant
);

export default router;
