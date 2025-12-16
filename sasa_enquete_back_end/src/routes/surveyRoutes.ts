import { Router } from "express";
import {
  createSurvey,
  updateSurvey,
  getSurvey,
  listSurveys,
  publishSurvey,
} from "../controllers/surveyController";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
// import { buildPagination } from "../helpers/query";

const router = Router();
router.use(tenantFromSlug, authMiddleware);

// router.get("/surveys", buildPagination, listSurveys);
router.get("/t/:slug/surveys", listSurveys);
router.post(
  "/t/:slug/surveys",
  requireRole(["OWNER", "ADMIN", "EDITOR", "ENQUETEUR"]),
  createSurvey
);
router.get(
  "/t/:slug/surveys/:id",
  requireRole(["OWNER", "ADMIN", "EDITOR", "ENQUETEUR", "SUPERVISEUR"]),
  getSurvey
);
router.put(
  "/t/:slug/surveys/:id",
  requireRole(["OWNER", "ADMIN", "EDITOR"]),
  updateSurvey
);
router.post(
  "/t/:slug/surveys/:id/publish",
  requireRole(["OWNER", "ADMIN", "SUPERVISEUR"]),
  publishSurvey
);

export default router;
