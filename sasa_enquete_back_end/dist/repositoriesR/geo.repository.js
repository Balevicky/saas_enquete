// src/repositories/geo.repository.ts
import { BaseRepository } from "./base.repository";
export class GeoRepository extends BaseRepository {
    // ----- Région -----
    createRegion(data) {
        return this.prisma.region.create({ data });
    }
    listRegions(tenantId) {
        return this.prisma.region.findMany({ where: { tenantId } });
    }
    updateRegion(id, data) {
        return this.prisma.region.update({ where: { id }, data });
    }
    deleteRegion(id) {
        return this.prisma.region.delete({ where: { id } });
    }
    // ----- Département -----
    createDepartement(data) {
        return this.prisma.departement.create({ data });
    }
    listDepartements(tenantId) {
        return this.prisma.departement.findMany({ where: { tenantId } });
    }
    updateDepartement(id, data) {
        return this.prisma.departement.update({ where: { id }, data });
    }
    deleteDepartement(id) {
        return this.prisma.departement.delete({ where: { id } });
    }
    // ----- Secteur -----
    createSecteur(data) {
        return this.prisma.secteur.create({ data });
    }
    listDSecteurs(tenantId) {
        return this.prisma.secteur.findMany({ where: { tenantId } });
    }
    updateDSecteur(id, data) {
        return this.prisma.secteur.update({ where: { id }, data });
    }
    deleteSecteurt(id) {
        return this.prisma.secteur.delete({ where: { id } });
    }
    // ----- village -----
    createVillage(data) {
        return this.prisma.village.create({ data });
    }
    listVillages(tenantId) {
        return this.prisma.village.findMany({ where: { tenantId } });
    }
    updateVillage(id, data) {
        return this.prisma.village.update({ where: { id }, data });
    }
    deleteVillage(id) {
        return this.prisma.village.delete({ where: { id } });
    }
}
