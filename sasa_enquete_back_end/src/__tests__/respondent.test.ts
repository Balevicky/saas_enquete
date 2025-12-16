import request from "supertest";
import app from "../app";
import { createTenant } from "./factories/tenant.factory";
import { createUser } from "./factories/user.factory";
import { createSurvey } from "./factories/survey.factory";

describe("Respondent API", () => {
  it("ENQUETEUR peut créer un respondent", async () => {
    const tenant = await createTenant();
    const user = await createUser(tenant.id, "ENQUETEUR");
    const survey = await createSurvey(tenant.id, user.id);

    const res = await request(app)
      .post(`/t/${tenant.slug}/surveys/${survey.id}/respondents`)
      .set("Authorization", `Bearer test-token-${user.id}`)
      .send({ name: "Doe", firstname: "John" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Doe");
  });
});
