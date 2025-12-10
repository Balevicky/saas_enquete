// src/repositories/tenant.repository.ts
import { BaseRepository } from "./base.repository";

export class TenantRepository extends BaseRepository {
  findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  updateSettings(tenantId: string, data: any) {
    return this.prisma.settings.update({ where: { tenantId }, data });
  }

  getSettings(tenantId: string) {
    return this.prisma.settings.findUnique({ where: { tenantId } });
  }
}
