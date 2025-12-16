import prisma from "../prisma";

beforeAll(async () => {
  await prisma.$connect();
});

afterEach(async () => {
  await prisma.response.deleteMany();
  await prisma.respondent.deleteMany();
  await prisma.question.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
