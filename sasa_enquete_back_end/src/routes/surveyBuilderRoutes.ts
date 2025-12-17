import { Router } from "express";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { SurveyBuilderController } from "../controllers/surveyBuilderController";

const router = Router();
router.use(tenantFromSlug, authMiddleware);

// 🔧 Mettre à jour le JSON builder et synchroniser les questions
router.put(
  "/t/:slug/surveys/:id/builder",
  requireRole(["OWNER", "ADMIN", "EDITOR"]),
  SurveyBuilderController.updateBuilder
);

export default router;
