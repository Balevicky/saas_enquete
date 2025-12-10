import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function tenantExtractor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const host = req.headers.host || "";
  // example: acme.monsaas.com:4000 -> extract first subdomain
  const baseDomain = process.env.BASE_DOMAIN || "monsaas.com";
  const hostWithoutPort = host.split(":")[0];

  let tenantSlug = undefined;
  if (
    hostWithoutPort === "localhost" ||
    hostWithoutPort.endsWith(`.${baseDomain}`) === false
  ) {
    // fallback: allow passing tenant via header for local dev
    tenantSlug = req.headers["x-tenant-slug"] as string | undefined;
  } else {
    const parts = hostWithoutPort.split(".");
    if (parts.length > 2) tenantSlug = parts[0];
  }

  if (!tenantSlug) {
    // allow explicit query param for dev
    tenantSlug = req.query.tenant as string | undefined;
  }

  if (!tenantSlug) return next();

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });

  (req as any).tenantId = tenant.id;
  (req as any).tenant = tenant;

  next();
}
