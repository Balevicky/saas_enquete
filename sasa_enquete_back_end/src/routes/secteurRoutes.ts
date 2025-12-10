import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import SecteurController from "../controllers/secteurController";
import {
  createSecteurSchema,
  updateSecteurSchema,
} from "../validations/geoValidation";

const router = Router();

// Secteurs
router.post(
  "/secteurs",
  authMiddleware,
  validate(createSecteurSchema),
  SecteurController.create
);
router.get("/secteurs", authMiddleware, SecteurController.list);
router.get("/secteurs/:id", authMiddleware, SecteurController.get);

router.put(
  "/secteurs/:id",
  authMiddleware,
  validate(updateSecteurSchema),
  SecteurController.update
);
router.delete("/secteurs/:id", authMiddleware, SecteurController.remove);

export default router;
