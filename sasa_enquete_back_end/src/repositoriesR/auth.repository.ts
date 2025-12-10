// src/repositories/auth.repository.ts
import { BaseRepository } from "./base.repository";

export class AuthRepository extends BaseRepository {
  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  createUser(data: any) {
    return this.prisma.user.create({ data });
  }

  linkUserToTenant(userId: string, tenantId: string) {
    return this.prisma.userTenant.create({ data: { userId, tenantId } });
  }
}
