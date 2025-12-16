import prisma from "../../prisma";
import type { Role } from "@prisma/client";
export async function createUser(tenantId: string, role = "ADMIN") {
  return prisma.user.create({
    data: {
      email: `${Math.random()}@test.com`,
      password: "hashed",
      //   role,
      //   tenantId,
    },
  });
}
