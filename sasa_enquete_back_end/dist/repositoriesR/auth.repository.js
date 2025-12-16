// src/repositories/auth.repository.ts
import { BaseRepository } from "./base.repository";
export class AuthRepository extends BaseRepository {
    findUserByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    createUser(data) {
        return this.prisma.user.create({ data });
    }
    linkUserToTenant(userId, tenantId) {
        return this.prisma.userTenant.create({ data: { userId, tenantId } });
    }
}
