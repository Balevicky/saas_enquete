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
// req.params.slug;
// const router = Router();
const router = Router({ mergeParams: true });
router.use(tenantFromSlug, authMiddleware);

// "/t/:slug/departements",
// router.get("/surveys", buildPagination, listSurveys);
router.get("/surveys", listSurveys);
router.post(
  "/surveys",
  requireRole(["OWNER", "ADMIN", "EDITOR", "ENQUETEUR"]),
  createSurvey
);
// router.post(
//   "/surveys",
//   requireRole(["OWNER", "ADMIN", "EDITOR", "ENQUETEUR"]),
//   createSurvey
// );
router.get(
  "/surveys/:id",
  requireRole(["OWNER", "ADMIN", "EDITOR", "ENQUETEUR", "SUPERVISEUR"]),
  getSurvey
);
router.put(
  "/surveys/:id",
  requireRole(["OWNER", "ADMIN", "EDITOR"]),
  updateSurvey
);
router.post(
  "/surveys/:id/publish",
  requireRole(["OWNER", "ADMIN", "SUPERVISEUR"]),
  publishSurvey
);

export default router;
