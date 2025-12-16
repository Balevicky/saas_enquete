// src/routes/region.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import RegionController from "../controllers/regionController";
import { validate } from "../middlewares/validateMiddleware";
import { createRegionSchema, updateRegionSchema, } from "../validations/geoValidation";
const router = Router();
// Toutes les routes incluent maintenant /t/:slug
router.post("/t/:slug/regions", tenantFromSlug, // extraire tenantId depuis slug
authMiddleware, // vérifier JWT + tenant
validate(createRegionSchema), RegionController.create);
router.get("/t/:slug/regions", tenantFromSlug, authMiddleware, RegionController.list);
router.get("/t/:slug/regions/:id", tenantFromSlug, authMiddleware, RegionController.get);
router.put("/t/:slug/regions/:id", tenantFromSlug, authMiddleware, validate(updateRegionSchema), RegionController.update);
router.delete("/t/:slug/regions/:id", tenantFromSlug, authMiddleware, RegionController.remove);
export default router;
