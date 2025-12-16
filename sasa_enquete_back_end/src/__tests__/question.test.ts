import request from "supertest";
import app from "../app";
import { createTenant } from "./factories/tenant.factory";
import { createUser } from "./factories/user.factory";
import { createSurvey } from "./factories/survey.factory";

describe("Question API – Phase B", () => {
  it("ADMIN peut créer une question", async () => {
    const tenant = await createTenant();
    const user = await createUser(tenant.id, "ADMIN");
    const survey = await createSurvey(tenant.id, user.id);

    const res = await request(app)
      .post(`/t/${tenant.slug}/surveys/${survey.id}/questions`)
      .set("Authorization", `Bearer test-token-${user.id}`)
      .send({
        label: "Age",
        type: "NUMBER",
        position: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.label).toBe("Age");
  });

  it("ENQUETEUR ne peut pas créer une question", async () => {
    const tenant = await createTenant();
    const user = await createUser(tenant.id, "ENQUETEUR");
    const survey = await createSurvey(tenant.id, user.id);

    const res = await request(app)
      .post(`/t/${tenant.slug}/surveys/${survey.id}/questions`)
      .set("Authorization", `Bearer test-token-${user.id}`)
      .send({
        label: "Age",
        type: "NUMBER",
        position: 1,
      });

    expect(res.status).toBe(403);
  });
});
