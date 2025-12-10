// src/repositories/invite.repository.ts
import { BaseRepository } from "./base.repository";

export class InviteRepository extends BaseRepository {
  createInvite(data: any) {
    return this.prisma.invite.create({ data });
  }

  findByToken(token: string) {
    return this.prisma.invite.findUnique({ where: { token } });
  }

  listInvites(tenantId: string) {
    return this.prisma.invite.findMany({ where: { tenantId } });
  }
}
