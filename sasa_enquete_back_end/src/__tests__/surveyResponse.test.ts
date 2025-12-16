import request from "supertest";
import app from "../app";
import { createTenant } from "./factories/tenant.factory";
import { createUser } from "./factories/user.factory";
import { createSurvey } from "./factories/survey.factory";

describe("SurveyResponse API", () => {
  it("SUPERVISEUR peut créer un surveyResponse", async () => {
    const tenant = await createTenant();
    const user = await createUser(tenant.id, "SUPERVISEUR");
    const survey = await createSurvey(tenant.id, user.id);

    const res = await request(app)
      .post(`/t/${tenant.slug}/surveys/${survey.id}/survey-responses`)
      .set("Authorization", `Bearer test-token-${user.id}`)
      .send({
        answers: { q1: 10 },
        meta: { device: "android" },
      });

    expect(res.status).toBe(201);
    expect(res.body.answers.q1).toBe(10);
  });
});
