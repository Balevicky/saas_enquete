import { Request, Response } from "express";
import prisma from "../prisma";
import { buildPagination, buildSearchFilter } from "../utils/pagination";

class RegionController {
  static async create(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const { name } = req.body;
    if (!tenantId) return res.status(400).json({ error: "Tenant missing" });
    const region = await prisma.region.create({ data: { name, tenantId } });
    return res.status(201).json(region);
  }
  static async list(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant missing" });

    // Pagination
    const { skip, take } = buildPagination(req.query);

    // Filtre par nom
    const nameFilter = buildSearchFilter(
      req.query.search as string | undefined
    );

    const regions = await prisma.region.findMany({
      where: {
        tenantId,
        ...(nameFilter && { name: nameFilter }),
        // ...(Object.keys(nameFilter).length ? { name: nameFilter } : {}),
      },
      include: { departements: true },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });

    // Total pour le frontend
    const total = await prisma.region.count({
      where: {
        tenantId,
        ...(nameFilter && { name: nameFilter }),
      },
    });

    return res.json({
      data: regions,
      meta: {
        total,
        page: Number(req.query.page) || 1,
        perPage: Number(req.query.perPage) || take,
      },
    });
  }

  static async get(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const id = req.params.id;
    const region = await prisma.region.findFirst({
      where: { id, tenantId },
      include: { departements: true },
    });
    if (!region) return res.status(404).json({ error: "Not found" });
    return res.json(region);
  }

  static async update(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const id = req.params.id;
    const data = req.body;

    // Vérifier que la région appartient au tenant
    const existing = await prisma.region.findFirst({ where: { id, tenantId } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const region = await prisma.region.update({ where: { id }, data });
    return res.json(region);
  }

  static async remove(req: Request, res: Response) {
    const tenantId = (req as any).tenantId;
    const id = req.params.id;

    const existing = await prisma.region.findFirst({ where: { id, tenantId } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    await prisma.region.delete({ where: { id } });
    return res.status(204).send();
  }
}

export default RegionController;
