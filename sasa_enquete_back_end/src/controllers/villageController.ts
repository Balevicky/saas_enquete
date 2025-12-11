import { Request, Response } from "express";
import prisma from "../prisma";
import { buildPagination, buildSearchFilter } from "../utils/pagination";

class VillageController {
  // Créer un village
  static async create(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const { name, secteurId } = req.body;

    // Vérifier que le secteur existe et appartient au tenant
    const secteur = await prisma.secteur.findFirst({
      where: { id: secteurId, tenantId },
    });
    if (!secteur)
      return res
        .status(404)
        .json({ error: "Secteur not found or does not belong to tenant" });

    // Upsert pour éviter doublon (tenantId + secteurId + name)
    const created = await prisma.village.upsert({
      where: { name_secteurId_tenantId: { tenantId, secteurId, name } },
      update: {},
      create: { tenantId, secteurId, name },
    });

    return res.status(201).json(created);
  }

  // Lister les villages
  // static async list(req: Request, res: Response) {
  //   const tenantId = (req as any).tenantId;
  //   const secteurId = req.query.secteurId as string | undefined;

  //   const where: any = { tenantId };
  //   if (secteurId) where.secteurId = secteurId;

  //   const data = await prisma.village.findMany({ where });
  //   return res.json(data);
  // }
  static async list(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant missing" });

    const { skip, take } = buildPagination(req.query);
    const nameFilter = buildSearchFilter(
      req.query.search as string | undefined
    );
    const secteurId = req.query.secteurId as string | undefined;

    const where: any = { tenantId };
    if (secteurId) where.secteurId = secteurId;
    if (Object.keys(nameFilter).length) where.name = nameFilter;

    const villages = await prisma.village.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.village.count({ where });

    return res.json({
      data: villages,
      meta: {
        total,
        page: Number(req.query.page) || 1,
        perPage: Number(req.query.perPage) || take,
      },
    });
  }

  // Obtenir un village par ID
  static async get(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;

    const village = await prisma.village.findFirst({
      where: { id, tenantId },
    });

    if (!village) return res.status(404).json({ error: "Not found" });
    return res.json(village);
  }

  // Mettre à jour un village
  static async update(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;
    const { name, secteurId } = req.body;

    // Vérifier que le village appartient au tenant
    const existing = await prisma.village.findFirst({
      where: { id, tenantId },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });

    // Si secteurId est changé, vérifier qu'il appartient au tenant
    if (secteurId) {
      const secteur = await prisma.secteur.findFirst({
        where: { id: secteurId, tenantId },
      });
      if (!secteur)
        return res
          .status(404)
          .json({ error: "Secteur not found or does not belong to tenant" });
    }

    const updated = await prisma.village.update({
      where: { id },
      data: { name, secteurId },
    });

    return res.json(updated);
  }

  // Supprimer un village
  static async remove(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;

    const existing = await prisma.village.findFirst({
      where: { id, tenantId },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });

    await prisma.village.delete({ where: { id } });
    return res.status(204).send();
  }
}

export default VillageController;
