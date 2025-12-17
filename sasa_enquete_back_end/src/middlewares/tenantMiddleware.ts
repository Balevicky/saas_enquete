import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function tenantFromSlug(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = req.params.slug;
    console.log("👉 tenantFromSlug");
    console.log("slug =", req.params.slug);

    console.log("➡️ URL appelée :", req.originalUrl);
    console.log("slug dans tenantMiddle", slug);
    // console.log("JWT tenant:", (req as any).user.tenantId);
    console.log("URL tenant dans tenantMiddle:", (req as any).params.slug);
    if (!slug) return res.status(400).json({ error: "Tenant slug missing" });

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    (req as any).tenantId = tenant.id;
    (req as any).tenant = tenant;

    next();
  } catch (err) {
    console.error("tenantFromSlug error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
