import request from "supertest";
import app from "../app";
import prisma from "../prisma";
import { createTenant } from "./factories/tenant.factory";
import { createUser } from "./factories/user.factory";
import { createSurvey } from "./factories/survey.factory";

describe("Response API", () => {
  it("ENQUETEUR peut enregistrer une réponse", async () => {
    const tenant = await createTenant();
    const user = await createUser(tenant.id, "ENQUETEUR");
    const survey = await createSurvey(tenant.id, user.id);

    const question = await prisma.question.create({
      data: {
        tenantId: tenant.id,
        surveyId: survey.id,
        label: "Age",
        type: "NUMBER",
        position: 1,
      },
    });

    const respondent = await prisma.respondent.create({
      data: {
        tenantId: tenant.id,
        surveyId: survey.id,
      },
    });

    const res = await request(app)
      .post(`/t/${tenant.slug}/respondents/${respondent.id}/responses`)
      .set("Authorization", `Bearer test-token-${user.id}`)
      .send({
        questionId: question.id,
        answer: 25,
      });

    expect(res.status).toBe(201);
    expect(res.body.answer).toBe(25);
  });
});
