import prisma from "../prisma";
import { buildPagination, buildSearchFilter } from "../utils/pagination";
class SecteurController {
    // Créer un secteur
    static async create(req, res) {
        const tenantId = req.tenantId;
        const { name, departementId } = req.body;
        // Vérifier que le département existe et appartient au tenant
        const departement = await prisma.departement.findFirst({
            where: { id: departementId, tenantId },
        });
        if (!departement)
            return res
                .status(404)
                .json({ error: "Departement not found or does not belong to tenant" });
        // Upsert pour éviter les doublons (tenantId + departementId + name)
        const created = await prisma.secteur.upsert({
            where: {
                name_departementId_tenantId: { tenantId, departementId, name },
            },
            update: {},
            create: { tenantId, departementId, name },
        });
        return res.status(201).json(created);
    }
    // Lister les secteurs
    // static async list(req: Request, res: Response) {
    //   const tenantId = (req as any).tenantId;
    //   const departementId = req.query.departementId as string | undefined;
    //   const where: any = { tenantId };
    //   if (departementId) where.departementId = departementId;
    //   const data = await prisma.secteur.findMany({
    //     where,
    //     include: { villages: true },
    //   });
    //   return res.json(data);
    // }
    static async list(req, res) {
        const tenantId = req.tenantId;
        if (!tenantId)
            return res.status(400).json({ error: "Tenant missing" });
        const { skip, take } = buildPagination(req.query);
        const nameFilter = buildSearchFilter(req.query.search);
        const departementId = req.query.departementId;
        const where = { tenantId };
        if (departementId)
            where.departementId = departementId;
        if (Object.keys(nameFilter).length)
            where.name = nameFilter;
        const secteurs = await prisma.secteur.findMany({
            where,
            include: { villages: true },
            skip,
            take,
            orderBy: { createdAt: "desc" },
        });
        const total = await prisma.secteur.count({ where });
        return res.json({
            data: secteurs,
            meta: {
                total,
                page: Number(req.query.page) || 1,
                perPage: Number(req.query.perPage) || take,
            },
        });
    }
    // Obtenir un secteur par ID
    static async get(req, res) {
        const tenantId = req.tenantId;
        const { id } = req.params;
        const secteur = await prisma.secteur.findFirst({
            where: { id, tenantId },
            include: { villages: true },
        });
        if (!secteur)
            return res.status(404).json({ error: "Not found" });
        return res.json(secteur);
    }
    // Mettre à jour un secteur
    static async update(req, res) {
        const tenantId = req.tenantId;
        const { id } = req.params;
        const { name, departementId } = req.body;
        // Vérifier que le secteur appartient au tenant
        const existing = await prisma.secteur.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            return res.status(404).json({ error: "Not found" });
        // Si departementId est changé, vérifier qu'il appartient au tenant
        if (departementId) {
            const dep = await prisma.departement.findFirst({
                where: { id: departementId, tenantId },
            });
            if (!dep)
                return res.status(404).json({
                    error: "Departement not found or does not belong to tenant",
                });
        }
        const updated = await prisma.secteur.update({
            where: { id },
            data: { name, departementId },
        });
        return res.json(updated);
    }
    // Supprimer un secteur
    static async remove(req, res) {
        const tenantId = req.tenantId;
        const { id } = req.params;
        const existing = await prisma.secteur.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            return res.status(404).json({ error: "Not found" });
        await prisma.secteur.delete({ where: { id } });
        return res.status(204).send();
    }
}
export default SecteurController;
