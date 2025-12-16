import { Router } from "express";
import { RespondentController } from "../controllers/respondentController";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();
router.use(tenantFromSlug, authMiddleware);

router.get(
  "/t/:slug/surveys/:surveyId/respondents",
  requireRole(["OWNER", "ADMIN", "SUPERVISEUR"]),
  RespondentController.list
);

router.post(
  "/t/:slug/surveys/:surveyId/respondents",
  requireRole(["ENQUETEUR", "SUPERVISEUR"]),
  RespondentController.create
);

router.get(
  "/t/:slug/respondents/:id",
  requireRole(["OWNER", "ADMIN", "SUPERVISEUR"]),
  RespondentController.get
);

router.post(
  "/t/:slug/respondents/:id/complete",
  requireRole(["ENQUETEUR", "SUPERVISEUR"]),
  RespondentController.complete
);

export default router;
