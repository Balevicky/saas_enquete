import { Router } from "express";
import { ResponseController } from "../controllers/responseController";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();
router.use(tenantFromSlug, authMiddleware);

router.post(
  "/t/:slug/respondents/:respondentId/responses",
  requireRole(["ENQUETEUR"]),
  ResponseController.saveOrUpdateAll
);

// router.post(
//   "/t/:slug/respondents/:respondentId/responses",
//   requireRole(["ENQUETEUR"]),
//   ResponseController.save
// );

export default router;
