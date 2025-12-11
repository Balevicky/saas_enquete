// // src/routes/auth.routes.ts
// import { Router } from "express";
// import { AuthController } from "../controllers/authController";

// const router = Router();
// router.post("/register", AuthController.register);
// router.post("/login", AuthController.login);
// router.post("/refresh", AuthController.refresh);
// ===========================================
import { Router } from "express";
import AuthController from "../controllers/authController";
import { validate } from "../middlewares/validateMiddleware";
import { tenantFromSlug } from "../middlewares/tenantMiddleware";

import {
  loginSchema,
  registerSchema,
  signupTenantSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/authValidation";

const router = Router();

// Create a new tenant + owner (does NOT need tenantFromSlug)
router.post(
  "/signup",
  validate(signupTenantSchema),
  AuthController.signupTenant
);

// ↓↓↓ All below require the tenant slug in the URL ↓↓↓

router.post(
  "/t/:slug/register",
  tenantFromSlug,
  validate(registerSchema),
  AuthController.register
);

router.post(
  // "/t/:slug/login",
  "/login",
  tenantFromSlug,
  validate(loginSchema),
  AuthController.login
);

router.post(
  "/t/:slug/forgot-password",
  tenantFromSlug,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  "/t/:slug/reset-password",
  tenantFromSlug,
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

export default router;
