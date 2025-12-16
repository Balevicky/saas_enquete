// src/routes/village.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import VillageController from "../controllers/villageController";
import { createVillageSchema, updateVillageSchema, } from "../validations/geoValidation";
const router = Router();
// POST /t/:slug/villages
router.post("/t/:slug/villages", tenantFromSlug, // injecte tenantId
authMiddleware, // vérifie JWT + tenant
validate(createVillageSchema), VillageController.create);
// GET /t/:slug/villages
router.get("/t/:slug/villages", tenantFromSlug, authMiddleware, VillageController.list);
// GET /t/:slug/villages/:id
router.get("/t/:slug/villages/:id", tenantFromSlug, authMiddleware, VillageController.get);
// PUT /t/:slug/villages/:id
router.put("/t/:slug/villages/:id", tenantFromSlug, authMiddleware, validate(updateVillageSchema), VillageController.update);
// DELETE /t/:slug/villages/:id
router.delete("/t/:slug/villages/:id", tenantFromSlug, authMiddleware, VillageController.remove);
export default router;
