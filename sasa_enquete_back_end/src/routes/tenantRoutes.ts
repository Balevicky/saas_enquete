import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import TenantController from "../controllers/tenantController";
import { validate } from "../middlewares/validateMiddleware";
import {
  createTenantSchema,
  updateSettingsSchema,
} from "../validations/tenantValidation";

const router = Router();

// GET settings
router.get(
  "/t/:slug/settings",
  tenantFromSlug,
  authMiddleware,
  TenantController.getSettings
);

// UPDATE settings
router.put(
  "/t/:slug/settings",
  tenantFromSlug,
  authMiddleware,
  validate(updateSettingsSchema),
  TenantController.updateSettings
);

// ADMIN: CREATE tenant
router.post(
  "/t/:slug/create",
  tenantFromSlug,
  authMiddleware,
  validate(createTenantSchema),
  TenantController.createTenant
);

export default router;
