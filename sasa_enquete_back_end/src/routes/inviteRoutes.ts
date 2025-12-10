import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import InviteController from "../controllers/inviteController";
import {
  createInviteSchema,
  acceptInviteSchema,
} from "../validations/inviteValidation";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validate(createInviteSchema),
  InviteController.create
);
router.post("/accept", validate(acceptInviteSchema), InviteController.accept);
router.get("/", authMiddleware, InviteController.list);
router.delete("/:id", authMiddleware, InviteController.revoke);

export default router;
