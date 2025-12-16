// src/routes/invite.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import InviteController from "../controllers/inviteController";
import { createInviteSchema, acceptInviteSchema, } from "../validations/inviteValidation";
const router = Router();
// Tous les endpoints pour un tenant spécifique
// URL: /t/:slug/invites
router.post("/t/:slug/invites", tenantFromSlug, // récupère tenantId depuis slug
authMiddleware, // vérifie JWT et correspondance tenantId
validate(createInviteSchema), InviteController.create);
router.post("/t/:slug/invites/accept", tenantFromSlug, // tenantId nécessaire pour validation
validate(acceptInviteSchema), InviteController.accept);
router.get("/t/:slug/invites", tenantFromSlug, authMiddleware, InviteController.list);
router.delete("/t/:slug/invites/:id", tenantFromSlug, authMiddleware, InviteController.revoke);
export default router;
