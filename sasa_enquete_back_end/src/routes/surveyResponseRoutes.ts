import { Router } from "express";
import { SurveyResponseController } from "../controllers/surveyResponseController";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();
router.use(tenantFromSlug, authMiddleware);

router.get(
  "/t/:slug/surveys/:surveyId/survey-responses",
  requireRole(["OWNER", "ADMIN"]),
  SurveyResponseController.list
);

router.post(
  "/t/:slug/surveys/:surveyId/survey-responses",
  requireRole(["ENQUETEUR", "SUPERVISEUR"]),
  SurveyResponseController.create
);

export default router;
