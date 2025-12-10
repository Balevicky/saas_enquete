// src/routes/tenant.routes.ts
// import { Router } from "express";
// import { authMiddleware } from "../middlewares/authMiddleware";
// import TenantController from "../controllers/tenantController";

// const router = Router();
// router.get("/settings", authMiddleware, TenantController.getSettings);
// router.put("/settings", authMiddleware, TenantController.updateSettings);

// export default router;
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import TenantController from "../controllers/tenantController";
import { validate } from "../middlewares/validateMiddleware";
import { z } from "zod";
import {
  createTenantSchema,
  updateSettingsSchema,
} from "../validations/tenantValidation";
const router = Router();

// GET tenant settings (requires auth)
router.get("/settings", authMiddleware, TenantController.getSettings);

// Update settings (requires auth & appropriate role)
router.put(
  "/settings",
  authMiddleware,
  validate(updateSettingsSchema),
  TenantController.updateSettings
);

// Admin: create a tenant (rare, owner-level operation) - optionally protected by an admin API key in prod
router.post(
  "/create",
  authMiddleware,
  validate(createTenantSchema),
  TenantController.createTenant
);

export default router;
