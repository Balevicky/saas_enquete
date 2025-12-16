import prisma from "../../prisma";

export async function createSurvey(tenantId: string, createdBy: string) {
  return prisma.survey.create({
    data: {
      title: "Survey Test",
      json: {},
      tenantId,
      createdBy,
      status: "DRAFT",
    },
  });
}
