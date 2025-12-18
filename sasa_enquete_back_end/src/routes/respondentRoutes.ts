import { Router } from "express";
import { RespondentController } from "../controllers/respondentController";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

// const router = Router();
const router = Router({ mergeParams: true });
router.use(tenantFromSlug, authMiddleware);

router.get(
  "/surveys/:surveyId/respondents",
  requireRole(["OWNER", "ADMIN", "SUPERVISEUR"]),
  RespondentController.list
);

router.post(
  "/surveys/:surveyId/respondents",
  // requireRole(["ENQUETEUR", "SUPERVISEUR"]),
  RespondentController.create
);

router.get(
  "/respondents/:id",
  requireRole(["OWNER", "ADMIN", "SUPERVISEUR"]),
  RespondentController.get
);

router.post(
  "/respondents/:id/complete",
  requireRole(["ENQUETEUR", "SUPERVISEUR"]),
  RespondentController.complete
);

export default router;
