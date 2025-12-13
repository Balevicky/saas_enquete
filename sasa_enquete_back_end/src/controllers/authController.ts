import { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import crypto from "crypto";
import { mailer } from "../utils/mailer";

// import { error } from "console";
// import { generateId } from "../utils/generateId";

const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// Strongly-typed request body helpers
type TypedRequestBody<T> = Request & { body: T; tenantId?: string };

type SignupTenantBody = {
  tenantName: string;
  tenantSlug: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerFullName?: string | null;
};

type RegisterBody = {
  email: string;
  password: string;
  fullName?: string | null;
};

type LoginBody = {
  email: string;
  password: string;
};

type ForgotPasswordBody = {
  email: string;
};

type ResetPasswordBody = {
  token: string;
  password: string;
};

type JwtPayload = {
  userId: string;
  tenantId: string;
  role: Role;
};

class AuthController {
  // Signup: create tenant + owner user
  static async signupTenant(
    req: TypedRequestBody<SignupTenantBody>,
    res: Response
  ) {
    try {
      // const id = await generateId();
      // const token = await generateId(32);
      const {
        tenantName,
        tenantSlug,
        ownerEmail,
        ownerPassword,
        ownerFullName,
      } = req.body;

      // prevent duplicate tenant slug or owner email
      const [existingTenant, existingUser] = await Promise.all([
        prisma.tenant.findUnique({ where: { slug: tenantSlug } }),
        prisma.user.findUnique({ where: { email: ownerEmail } }),
      ]);

      if (existingTenant)
        return res.status(400).json({ error: "Tenant slug already taken" });
      if (existingUser)
        return res.status(400).json({ error: "Email already in use" });

      const hashed = await bcrypt.hash(ownerPassword, 10);

      const tenant = await prisma.tenant.create({
        data: { name: tenantName, slug: tenantSlug },
      });
      const user = await prisma.user.create({
        data: { email: ownerEmail, password: hashed, fullName: ownerFullName },
      });

      await prisma.userTenant.create({
        data: { userId: user.id, tenantId: tenant.id, role: "OWNER" },
      });

      const payload: JwtPayload = {
        userId: user.id,
        tenantId: tenant.id,
        role: "OWNER" as Role,
      };
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"],
      });

      return res.status(201).json({
        tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
        user: { id: user.id, email: user.email, fullName: user.fullName },
        token,
      });
    } catch (err) {
      console.error("signupTenant error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Register into existing tenant (tenant must be extracted by middleware)
  static async register(req: TypedRequestBody<RegisterBody>, res: Response) {
    try {
      // const tenantId = req.tenantId;
      const tenantId = (req as any).tenantId;
      if (!tenantId) return res.status(400).json({ error: "Tenant missing" });

      const { email, password, fullName, role } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: "Email taken" });

      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashed, fullName },
      });
      await prisma.userTenant.create({
        data: { userId: user.id, tenantId, role: role || "USER" },
      });

      const payload: JwtPayload = {
        userId: user.id,
        tenantId,
        role: role || ("USER" as Role),
      };
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"],
      });
      console.log({
        token,
        user: { id: user.id, email: user.email, fullName: user.fullName },
      });

      return res.status(201).json({
        token,
        user: { id: user.id, email: user.email, fullName: user.fullName },
      });
    } catch (err) {
      console.error("register error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async login(req: TypedRequestBody<LoginBody>, res: Response) {
    try {
      const { email, password } = req.body;
      // const tenantId = req.tenantId;
      const tenantId = (req as any).tenantId;
      console.log("tenantId=", tenantId);

      if (!tenantId)
        return res.status(400).json({
          error: "Tenant missing",
        });

      // Select only the fields we need to keep typings narrow and avoid leaking password unnecessarily
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          fullName: true,
          tenants: {
            select: {
              tenantId: true,
              role: true,
            },
          },
        },
      });

      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const userTenant = user.tenants.find((t) => t.tenantId === tenantId);
      if (!userTenant)
        return res
          .status(403)
          .json({ error: "User does not belong to tenant" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });

      const payload: JwtPayload = {
        userId: user.id,
        tenantId,
        role: userTenant.role,
      };
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"],
      });

      return res.json({
        token,
        user: { id: user.id, email: user.email, fullName: user.fullName },
      });
    } catch (err) {
      console.error("login error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  static async forgotPassword(
    req: TypedRequestBody<ForgotPasswordBody>,
    res: Response
  ) {
    try {
      const { email } = req.body;

      // 🔐 tenantId injecté par middleware (/t/:tenantSlug)
      const tenantId = (req as any).tenantId;
      if (!tenantId) {
        // Réponse neutre (sécurité)
        return res.json({ ok: true });
      }

      /**
       * 🔎 Chercher l'utilisateur UNIQUEMENT
       * dans le tenant courant
       */
      const userTenant = await prisma.userTenant.findFirst({
        where: {
          tenantId,
          user: { email },
        },
        include: {
          user: true,
          tenant: true,
        },
      });

      // ⚠️ Toujours répondre OK (anti-enumeration)
      if (!userTenant) return res.json({ ok: true });

      // 1️⃣ Génération token sécurisé
      const token = crypto.randomBytes(32).toString("hex");

      // 2️⃣ Hash du token (jamais stocker le token brut)
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      // 3️⃣ Invalidation des anciens tokens non utilisés
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: userTenant.userId,
          tenantId,
          used: false,
        },
      });

      // 4️⃣ Sauvegarde DB
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: userTenant.userId,
          tenantId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min
        },
      });

      // 5️⃣ Lien frontend MULTI-TENANT
      const resetLink = `${process.env.FRONTEND_URL}/t/${userTenant.tenant.slug}/reset-password?token=${token}`;

      // 6️⃣ Envoi email
      await mailer.sendMail({
        to: userTenant.user.email,
        subject: `Reset your password – ${userTenant.tenant.name}`,
        html: `
        <p>Hello ${userTenant.user.fullName ?? ""},</p>
        <p>You requested a password reset for <strong>${
          userTenant.tenant.name
        }</strong>.</p>
        <p>
          <a href="${resetLink}">
            Reset my password
          </a>
        </p>
        <p>This link expires in 30 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
      });

      return res.json({ ok: true });
    } catch (err) {
      console.error("forgotPassword error", err);
      // 🔐 Réponse volontairement neutre
      return res.json({ ok: true });
    }
  }
  // static async forgotPassword(
  //   req: TypedRequestBody<ForgotPasswordBody>,
  //   res: Response
  // ) {
  //   try {
  //     const { email } = req.body;

  //     const user = await prisma.user.findUnique({ where: { email } });

  //     // Toujours répondre OK (sécurité)
  //     if (!user) return res.json({ ok: true });

  //     // 1️⃣ Génération token
  //     const token = crypto.randomBytes(32).toString("hex");

  //     // 2️⃣ Hash du token
  //     const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  //     // 3️⃣ Sauvegarde DB
  //     await prisma.passwordResetToken.create({
  //       data: {
  //         tokenHash,
  //         userId: user.id,
  //         expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min
  //       },
  //     });

  //     // 4️⃣ Lien frontend
  //     const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  //     // 5️⃣ Envoi email
  //     await mailer.sendMail({
  //       to: user.email,
  //       subject: "Reset your password",
  //       html: `
  //       <p>Hello,</p>
  //       <p>You requested a password reset.</p>
  //       <p>
  //         <a href="${resetLink}">
  //           Reset my password
  //         </a>
  //       </p>
  //       <p>This link expires in 30 minutes.</p>
  //     `,
  //     });

  //     return res.json({ ok: true });
  //   } catch (err) {
  //     console.error("forgotPassword error", err);
  //     return res.status(500).json({ error: "Internal server error" });
  //   }
  // }
  // =============================
  static async resetPassword(
    req: TypedRequestBody<ResetPasswordBody>,
    res: Response
  ) {
    try {
      const { token, password } = req.body;

      // 1️⃣ Hash reçu
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      // 2️⃣ Recherche token
      const reset = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!reset || reset.used || reset.expiresAt < new Date()) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // 3️⃣ Hash nouveau password
      const hashed = await bcrypt.hash(password, 10);

      // 4️⃣ Update user
      await prisma.user.update({
        where: { id: reset.userId },
        data: { password: hashed },
      });

      // 5️⃣ Marquer token comme utilisé
      await prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { used: true },
      });

      return res.json({ ok: true });
    } catch (err) {
      console.error("resetPassword error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // static async forgotPassword(
  //   req: TypedRequestBody<ForgotPasswordBody>,
  //   res: Response
  // ) {
  //   try {
  //     const { email } = req.body;
  //     const user = await prisma.user.findUnique({ where: { email } });
  //     if (!user) return res.json({ ok: true }); // don't reveal existence

  //     // store token temporarily (in production use a reset table with expiry)
  //     // We'll create a simple userReset table in DB in production. For now demonstrate using "settings" or similar is unsafe.
  //     await prisma.user.update({
  //       where: { id: user.id },
  //       data: {
  //         /* implement reset token storage */
  //       } as any,
  //     });

  //     // TODO: send email containing reset link with token

  //     return res.json({ ok: true });
  //   } catch (err) {
  //     console.error("forgotPassword error", err);
  //     return res.status(500).json({ error: "Internal server error" });
  //   }
  // }

  // static async resetPassword(
  //   req: TypedRequestBody<ResetPasswordBody>,
  //   res: Response
  // ) {
  //   try {
  //     const { token, password } = req.body;
  //     // TODO: verify token from storage, find user, and reset password securely
  //     return res.status(501).json({ error: "Not implemented" });
  //   } catch (err) {
  //     console.error("resetPassword error", err);
  //     return res.status(500).json({ error: "Internal server error" });
  //   }
  // }
}

export default AuthController;
