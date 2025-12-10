// src/controllers/tenant.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma";

class TenantController {
  // ============================
  // 1️⃣ GET tenant settings
  // ============================
  static async getSettings(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant missing" });

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    return res.json({ settings: tenant.settings || {} });
  }

  // ============================
  // 2️⃣ UPDATE tenant settings
  // ============================
  static async updateSettings(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const data = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: data },
    });

    return res.json({ settings: tenant.settings });
  }

  // ==========================================================
  // 3️⃣ CREATE TENANT (Admin action, used for SaaS super-admin)
  // ==========================================================
  static async createTenant(req: Request, res: Response) {
    try {
      // const { name, slug, settings } = req.body;
      const { name, slug, ownerEmail, ownerPassword, ownerFullName, settings } =
        req.body as any;

      // Vérifier si le slug existe déjà
      const exist = await prisma.tenant.findUnique({
        where: { slug },
      });

      if (exist) {
        return res.status(400).json({
          error: "This tenant slug already exists",
        });
      }

      // Créer tenant
      const tenant = await prisma.tenant.create({
        data: {
          name,
          slug,
          settings: settings || {},
        },
      });

      if (ownerEmail && ownerPassword) {
        // create user and assign OWNER
        const hashed = await require("bcryptjs").hash(ownerPassword, 10);
        const user = await prisma.user.create({
          data: {
            email: ownerEmail,
            password: hashed,
            fullName: ownerFullName,
          },
        });
        await prisma.userTenant.create({
          data: { userId: user.id, tenantId: tenant.id, role: "OWNER" },
        });
      }
      return res.status(201).json({
        message: "Tenant created successfully",
        result: tenant,
      });
    } catch (err) {
      console.error("❌ createTenant error:", err);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
}

export default TenantController;
