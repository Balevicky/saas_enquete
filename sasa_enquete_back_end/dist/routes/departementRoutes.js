// src/routes/departement.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import DepartementController from "../controllers/departementController";
import { createDepartementSchema, updateDepartementSchema, } from "../validations/geoValidation";
const router = Router();
// POST /t/:slug/departements
router.post("/t/:slug/departements", tenantFromSlug, // injecte tenantId
authMiddleware, // vérifie JWT + tenant
validate(createDepartementSchema), DepartementController.create);
// GET /t/:slug/departements
router.get("/t/:slug/departements", tenantFromSlug, authMiddleware, DepartementController.list);
// GET /t/:slug/departements/:id
router.get("/t/:slug/departements/:id", tenantFromSlug, authMiddleware, DepartementController.get);
// PUT /t/:slug/departements/:id
router.put("/t/:slug/departements/:id", tenantFromSlug, authMiddleware, validate(updateDepartementSchema), DepartementController.update);
// DELETE /t/:slug/departements/:id
router.delete("/t/:slug/departements/:id", tenantFromSlug, authMiddleware, DepartementController.remove);
export default router;
