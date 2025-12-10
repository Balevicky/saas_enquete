// src/repositories/geo.repository.ts
import { BaseRepository } from "./base.repository";

export class GeoRepository extends BaseRepository {
  // ----- Région -----
  createRegion(data: any) {
    return this.prisma.region.create({ data });
  }
  listRegions(tenantId: string) {
    return this.prisma.region.findMany({ where: { tenantId } });
  }
  updateRegion(id: string, data: any) {
    return this.prisma.region.update({ where: { id }, data });
  }
  deleteRegion(id: string) {
    return this.prisma.region.delete({ where: { id } });
  }

  // ----- Département -----
  createDepartement(data: any) {
    return this.prisma.departement.create({ data });
  }
  listDepartements(tenantId: string) {
    return this.prisma.departement.findMany({ where: { tenantId } });
  }
  updateDepartement(id: string, data: any) {
    return this.prisma.departement.update({ where: { id }, data });
  }
  deleteDepartement(id: string) {
    return this.prisma.departement.delete({ where: { id } });
  }
  // ----- Secteur -----
  createSecteur(data: any) {
    return this.prisma.secteur.create({ data });
  }
  listDSecteurs(tenantId: string) {
    return this.prisma.secteur.findMany({ where: { tenantId } });
  }
  updateDSecteur(id: string, data: any) {
    return this.prisma.secteur.update({ where: { id }, data });
  }
  deleteSecteurt(id: string) {
    return this.prisma.secteur.delete({ where: { id } });
  }
  // ----- village -----
  createVillage(data: any) {
    return this.prisma.village.create({ data });
  }
  listVillages(tenantId: string) {
    return this.prisma.village.findMany({ where: { tenantId } });
  }
  updateVillage(id: string, data: any) {
    return this.prisma.village.update({ where: { id }, data });
  }
  deleteVillage(id: string) {
    return this.prisma.village.delete({ where: { id } });
  }

  // etc… pour secteur & village
}
