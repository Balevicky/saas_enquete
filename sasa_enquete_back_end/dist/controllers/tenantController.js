import prisma from "../prisma";
import bcrypt from "bcryptjs";
class TenantController {
    // =========================
    // 1️⃣ GET tenant settings
    // =========================
    static async getSettings(req, res) {
        const tenantId = req.tenantId;
        if (!tenantId)
            return res.status(400).json({ error: "Tenant missing" });
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            return res.status(404).json({ error: "Tenant not found" });
        const settings = typeof tenant.settings === "object" && tenant.settings !== null
            ? tenant.settings
            : {};
        return res.json({ settings });
    }
    // =========================
    // 2️⃣ UPDATE General Settings
    // =========================
    static async updateGeneral(req, res) {
        const tenantId = req.tenantId;
        // 🔥 IMPORTANT : on attend DIRECTEMENT la section general
        const generalUpdates = req.body;
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant)
            return res.status(404).json({ error: "Tenant not found" });
        const currentSettings = typeof tenant.settings === "object" && tenant.settings !== null
            ? tenant.settings
            : {};
        const newSettings = {
            ...currentSettings,
            general: {
                ...currentSettings.general,
                ...generalUpdates,
            },
        };
        console.log("newSettings", newSettings);
        console.log("currentSettings.general", currentSettings.general);
        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                settings: newSettings,
            },
        });
        return res.json({
            settings: updatedTenant.settings,
        });
    }
    // static async updateGeneral(req: Request, res: Response) {
    //   const tenantId = (req as any).tenantId as string;
    //   const generalUpdates: TenantSettings["general"] = req.body;
    //   console.log("generalUpdates:", generalUpdates);
    //   const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    //   if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    //   const currentSettings: TenantSettings =
    //     typeof tenant.settings === "object" && tenant.settings !== null
    //       ? (tenant.settings as TenantSettings)
    //       : {};
    //   const currentGeneral = currentSettings.general || {};
    //   const newSettings: TenantSettings = {
    //     ...currentSettings,
    //     general: {
    //       ...currentGeneral,
    //       ...generalUpdates,
    //     },
    //   };
    //   const updatedTenant = await prisma.tenant.update({
    //     where: { id: tenantId },
    //     data: { settings: newSettings as Prisma.InputJsonValue },
    //   });
    //   return res.json({ settings: updatedTenant.settings });
    // }
    // =========================
    // 3️⃣ UPDATE Branding Settings
    // =========================
    static async updateBranding(req, res) {
        const tenantId = req.tenantId;
        const brandingUpdates = req.body;
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant)
            return res.status(404).json({ error: "Tenant not found" });
        const currentSettings = typeof tenant.settings === "object" && tenant.settings !== null
            ? tenant.settings
            : {};
        const newSettings = {
            ...currentSettings,
            branding: {
                ...currentSettings.branding,
                ...brandingUpdates,
            },
        };
        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                settings: newSettings,
            },
        });
        return res.json({
            settings: updatedTenant.settings,
        });
    }
    // static async updateBranding(req: Request, res: Response) {
    //   const tenantId = (req as any).tenantId as string;
    //   const brandingUpdates: TenantSettings["branding"] = req.body;
    //   const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    //   if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    //   const currentSettings: TenantSettings =
    //     typeof tenant.settings === "object" && tenant.settings !== null
    //       ? (tenant.settings as TenantSettings)
    //       : {};
    //   const currentBranding = currentSettings.branding || {};
    //   const newSettings: TenantSettings = {
    //     ...currentSettings,
    //     branding: {
    //       ...currentBranding,
    //       ...brandingUpdates,
    //     },
    //   };
    //   const updatedTenant = await prisma.tenant.update({
    //     where: { id: tenantId },
    //     data: { settings: newSettings as Prisma.InputJsonValue },
    //   });
    //   return res.json({ settings: updatedTenant.settings });
    // }
    // =========================
    // 4️⃣ CREATE TENANT (avec OWNER)
    // =========================
    static async createTenant(req, res) {
        try {
            const { name, slug, ownerEmail, ownerPassword, ownerFullName, settings } = req.body;
            const exist = await prisma.tenant.findUnique({ where: { slug } });
            if (exist) {
                return res
                    .status(400)
                    .json({ error: "This tenant slug already exists" });
            }
            const tenant = await prisma.tenant.create({
                data: {
                    name,
                    slug,
                    settings: (settings || {}),
                },
            });
            if (ownerEmail && ownerPassword) {
                const hashed = await bcrypt.hash(ownerPassword, 10);
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
            return res
                .status(201)
                .json({ message: "Tenant created successfully", result: tenant });
        }
        catch (err) {
            console.error("❌ createTenant error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
export default TenantController;
