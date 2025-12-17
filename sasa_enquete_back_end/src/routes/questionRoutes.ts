import { Router } from "express";
import { QuestionController } from "../controllers/questionController";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

// const router = Router();
const router = Router({ mergeParams: true });
router.use(tenantFromSlug, authMiddleware);

// Liste des questions pour un survey spécifique
router.get(
  "/surveys/:surveyId/questions",
  requireRole(["OWNER", "ADMIN", "EDITOR", "ENQUETEUR", "SUPERVISEUR"]),
  QuestionController.list
);

// Créer une question pour un survey
router.post(
  "/surveys/:surveyId/questions",
  requireRole(["OWNER", "ADMIN", "EDITOR"]),
  QuestionController.create
);

// Récupérer une question spécifique
router.get(
  // "/t/:slug/surveys/:surveyId/questions/:id",
  "/surveys/:surveyId/questions/:id",
  requireRole(["OWNER", "ADMIN", "EDITOR", "ENQUETEUR", "SUPERVISEUR"]),
  QuestionController.get
);

// Mettre à jour une question
router.put(
  "/surveys/:surveyId/questions/:id",
  requireRole(["OWNER", "ADMIN", "EDITOR"]),
  QuestionController.update
);

// Supprimer une question
router.delete(
  "/surveys/:surveyId/questions/:id",
  requireRole(["OWNER", "ADMIN"]),
  QuestionController.remove
);

export default router;
