import prisma from "../prisma";
import { parseFile } from "../utils/readFile";
class GeoImportController {
    static async import(req, res) {
        const tenantId = req.tenantId;
        if (!tenantId)
            return res.status(401).json({ error: "Tenant missing" });
        if (!req.file) {
            return res.status(400).json({ error: "A CSV or XLSX file is required" });
        }
        try {
            // Parse file according to mimetype
            const rows = parseFile(req.file.buffer, req.file.mimetype);
            /**
             * Expected structure:
             * { region, departement, secteur, village }
             */
            for (const row of rows) {
                const regionName = row.region?.trim();
                const deptName = row.departement?.trim();
                const secteurName = row.secteur?.trim();
                const villageName = row.village?.trim();
                if (!regionName)
                    return res.status(400).json({ error: "Missing region in a row" });
                // 1) REGION
                const region = await prisma.region.upsert({
                    where: {
                        name_tenantId: { name: regionName, tenantId },
                    },
                    update: {},
                    create: { name: regionName, tenantId },
                });
                // 2) DEPARTEMENT
                let departement = null;
                if (deptName) {
                    departement = await prisma.departement.upsert({
                        where: {
                            name_regionId_tenantId: {
                                name: deptName,
                                regionId: region.id,
                                tenantId,
                            },
                        },
                        update: {},
                        create: {
                            name: deptName,
                            regionId: region.id,
                            tenantId,
                        },
                    });
                }
                // 3) SECTEUR
                let secteur = null;
                if (secteurName && departement) {
                    secteur = await prisma.secteur.upsert({
                        where: {
                            name_departementId_tenantId: {
                                name: secteurName,
                                departementId: departement.id,
                                tenantId,
                            },
                        },
                        update: {},
                        create: {
                            name: secteurName,
                            departementId: departement.id,
                            tenantId,
                        },
                    });
                }
                // 4) VILLAGE
                if (villageName && secteur) {
                    await prisma.village.upsert({
                        where: {
                            name_secteurId_tenantId: {
                                name: villageName,
                                secteurId: secteur.id,
                                tenantId,
                            },
                        },
                        update: {},
                        create: {
                            name: villageName,
                            secteurId: secteur.id,
                            tenantId,
                        },
                    });
                }
            }
            return res.json({ message: "Import completed successfully" });
        }
        catch (e) {
            console.error(e);
            return res.status(500).json({ error: e.message });
        }
    }
}
export default GeoImportController;
