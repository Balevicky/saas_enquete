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
import {
  loginSchema,
  registerSchema,
  signupTenantSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/authValidation";

const router = Router();

// Create a new tenant + owner (public)
router.post(
  "/signup",
  validate(signupTenantSchema),
  AuthController.signupTenant
);

// Register a user inside the current tenant (requires tenant extracted)
router.post("/register", validate(registerSchema), AuthController.register);

router.post("/login", validate(loginSchema), AuthController.login);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

export default router;
