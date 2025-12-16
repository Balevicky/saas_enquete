import prisma from "../.././prisma";

export async function createTenant() {
  return prisma.tenant.create({
    data: {
      name: "Test Tenant",
      slug: "test-tenant",
    },
  });
}
