import { Request, Response } from "express";
import prisma from "../prisma";
import { buildPagination, buildSearchFilter } from "../utils/pagination";

class DepartementController {
  // Créer un département
  static async create(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const { name, regionId } = req.body;

    // Vérifier que la région existe et appartient au tenant
    const region = await prisma.region.findUnique({
      where: {
        // tenantId_name: {
        name_tenantId: {
          tenantId,
          name:
            (
              await prisma.region.findUnique({ where: { id: regionId } })
            )?.name || "",
        },
      },
    });
    if (!region)
      return res
        .status(404)
        .json({ error: "Region not found or does not belong to tenant" });

    // Upsert pour éviter les doublons
    const created = await prisma.departement.upsert({
      where: {
        // tenantId_regionId_name: {
        name_regionId_tenantId: {
          tenantId,
          regionId,
          name,
        },
      },
      update: {},
      create: { tenantId, regionId, name },
    });

    return res.status(201).json(created);
  }

  // Lister les départements
  // static async list(req: Request, res: Response) {
  //   const tenantId = (req as any).tenantId;
  //   const regionId = req.query.regionId as string | undefined;

  //   const where: any = { tenantId };
  //   if (regionId) where.regionId = regionId;

  //   const departements = await prisma.departement.findMany({
  //     where,
  //     include: { secteurs: true },
  //   });
  //   return res.json(departements);
  // }
  static async list(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant missing" });

    const { skip, take } = buildPagination(req.query);
    const nameFilter = buildSearchFilter(
      req.query.search as string | undefined
    );
    const regionId = req.query.regionId as string | undefined;

    const where: any = { tenantId };
    if (regionId) where.regionId = regionId;
    if (Object.keys(nameFilter).length) where.name = nameFilter;

    const departements = await prisma.departement.findMany({
      where,
      include: { secteurs: true },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.departement.count({ where });

    return res.json({
      data: departements,
      meta: {
        total,
        page: Number(req.query.page) || 1,
        perPage: Number(req.query.perPage) || take,
      },
    });
  }

  // Obtenir un département par ID
  static async get(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;

    const departement = await prisma.departement.findFirst({
      where: { id, tenantId },
      include: { secteurs: true },
    });

    if (!departement) return res.status(404).json({ error: "Not found" });
    return res.json(departement);
  }

  // Mettre à jour un département
  static async update(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;
    const { name, regionId } = req.body;

    // Vérifier que le département appartient au tenant
    const existing = await prisma.departement.findFirst({
      where: { id, tenantId },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });

    // Upsert ou update sécurisé
    const updated = await prisma.departement.update({
      where: { id },
      data: { name, regionId },
    });

    return res.json(updated);
  }

  // Supprimer un département
  static async remove(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;

    const existing = await prisma.departement.findFirst({
      where: { id, tenantId },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });

    await prisma.departement.delete({ where: { id } });
    return res.status(204).send();
  }
}

export default DepartementController;
