// src/repositories/tenant.repository.ts
import { BaseRepository } from "./base.repository";
export class TenantRepository extends BaseRepository {
    findBySlug(slug) {
        return this.prisma.tenant.findUnique({ where: { slug } });
    }
    updateSettings(tenantId, data) {
        return this.prisma.settings.update({ where: { tenantId }, data });
    }
    getSettings(tenantId) {
        return this.prisma.settings.findUnique({ where: { tenantId } });
    }
}
