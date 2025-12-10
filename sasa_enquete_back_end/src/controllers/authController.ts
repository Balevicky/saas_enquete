import { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import type { Role } from "@prisma/client";

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
      const tenantId = req.tenantId;
      if (!tenantId) return res.status(400).json({ error: "Tenant missing" });

      const { email, password, fullName } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: "Email taken" });

      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashed, fullName },
      });
      await prisma.userTenant.create({
        data: { userId: user.id, tenantId, role: "USER" },
      });

      const payload: JwtPayload = {
        userId: user.id,
        tenantId,
        role: "USER" as Role,
      };
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"],
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
      const tenantId = req.tenantId;
      if (!tenantId) return res.status(400).json({ error: "Tenant missing" });

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
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.json({ ok: true }); // don't reveal existence

      const token = nanoid(32);
      // store token temporarily (in production use a reset table with expiry)
      // We'll create a simple userReset table in DB in production. For now demonstrate using "settings" or similar is unsafe.
      await prisma.user.update({
        where: { id: user.id },
        data: {
          /* implement reset token storage */
        } as any,
      });

      // TODO: send email containing reset link with token

      return res.json({ ok: true });
    } catch (err) {
      console.error("forgotPassword error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async resetPassword(
    req: TypedRequestBody<ResetPasswordBody>,
    res: Response
  ) {
    try {
      const { token, password } = req.body;
      // TODO: verify token from storage, find user, and reset password securely
      return res.status(501).json({ error: "Not implemented" });
    } catch (err) {
      console.error("resetPassword error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default AuthController;
