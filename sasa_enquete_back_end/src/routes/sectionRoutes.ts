import { Router } from "express";
import { SectionController } from "../controllers/sectionController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

// const router = Router();
const router = Router({ mergeParams: true });
router.use(tenantFromSlug, authMiddleware);
/**
 * Sections liées à un survey
 */
router.get(
  //   "/t/:slug/surveys/:surveyId/sections",
  "/surveys/:surveyId/sections",
  requireRole(["OWNER", "ADMIN", "EDITOR", "ENQUETEUR", "SUPERVISEUR"]),
  SectionController.list
);

router.post(
  "/surveys/:surveyId/sections",
  //   "/t/:slug/surveys/:surveyId/sections",
  requireRole(["OWNER", "ADMIN", "EDITOR"]),
  SectionController.create
);

/**
 * Actions directes sur une section
 */
router.put(
  //   "/t/:slug/sections/:id",
  "/sections/:id",
  requireRole(["OWNER", "ADMIN"]),
  SectionController.update
);

router.delete(
  //   "/t/:slug/sections/:id",
  "/sections/:id",
  requireRole(["OWNER", "ADMIN", "EDITOR"]),
  SectionController.remove
);
// 🔹 🔀 REORDER
router.post(
  "/surveys/:surveyId/sections/:sectionId/reorder",
  requireRole(["OWNER", "ADMIN"]),
  SectionController.reorder
);

export default router;
// ==============================
// // Créer une question pour un survey
// router.post(
//   "/surveys/:surveyId/questions",
//   requireRole(["OWNER", "ADMIN", "EDITOR"]),
//   QuestionController.create
// );

// // Récupérer une question spécifique
// router.get(
//   // "/t/:slug/surveys/:surveyId/questions/:id",
//   "/surveys/:surveyId/questions/:id",
//   requireRole(["OWNER", "ADMIN", "EDITOR", "ENQUETEUR", "SUPERVISEUR"]),
//   QuestionController.get
// );

// // Mettre à jour une question
// router.put(
//   "/surveys/:surveyId/questions/:id",
//   requireRole(["OWNER", "ADMIN", "EDITOR"]),
//   QuestionController.update
// );

// // Supprimer une question
// router.delete(
//   "/surveys/:surveyId/questions/:id",
//   requireRole(["OWNER", "ADMIN"]),
//   QuestionController.remove
// );
