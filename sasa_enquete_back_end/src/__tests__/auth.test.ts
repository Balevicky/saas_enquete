import request from "supertest";
import app from "../app"; // adjusts according to your project structure

describe("Auth API (Multi-tenant A + C)", () => {
  let tenantToken: string;
  let ownerToken: string;

  // 1️⃣ Signup tenant + owner
  it("should create a new tenant and owner", async () => {
    const res = await request(app).post("/auth/register").send({
      tenantName: "TestTenant",
      tenantSlug: "testtenant",
      ownerEmail: "owner@test.com",
      ownerPassword: "password123",
      ownerFullName: "Owner Test",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("tenant");
    expect(res.body.tenant.slug).toBe("testtenant");

    tenantToken = res.body.token; // token after tenant creation
  });

  // 2️⃣ Login owner as tenant (Option A requires subdomain header)
  it("should login the owner inside the correct tenant", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Host", "testtenant.localhost") // important for Option A (subdomain)
      .send({
        email: "owner@test.com",
        password: "password123",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");

    ownerToken = res.body.token;
  });

  // 3️⃣ Test access to a protected route with tenantId from JWT
  it("should access a protected route with tenant JWT", async () => {
    const res = await request(app)
      .get("/me") // or /auth/me depending on your route
      .set("Authorization", `Bearer ${ownerToken}`)
      .set("Host", "testtenant.localhost");

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("owner@test.com");
  });
});
