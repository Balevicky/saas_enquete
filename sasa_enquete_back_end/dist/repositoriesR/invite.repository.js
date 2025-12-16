// src/repositories/invite.repository.ts
import { BaseRepository } from "./base.repository";
export class InviteRepository extends BaseRepository {
    createInvite(data) {
        return this.prisma.invite.create({ data });
    }
    findByToken(token) {
        return this.prisma.invite.findUnique({ where: { token } });
    }
    listInvites(tenantId) {
        return this.prisma.invite.findMany({ where: { tenantId } });
    }
}
