// src/routes/geoImport.routes.ts
import { Router } from "express";
import GeoImportController from "../controllers/GeoImportController";
import { upload } from "../middlewares/uploadMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
const router = Router();
// POST /t/:slug/import
router.post("/t/:slug/import", tenantFromSlug, // injecte tenantId dans req
authMiddleware, // vérifie JWT + correspondance tenant
upload.single("file"), // "file" = nom du champ envoyé
GeoImportController.import);
export default router;
