import request from "supertest";
import app from "../app"; // ton fichier principal express
describe("Auth API", () => {
    let token;
    it("signup tenant", async () => {
        const res = await request(app).post("/auth/signup").send({
            tenantName: "TestTenant",
            tenantSlug: "testtenant",
            ownerEmail: "owner@test.com",
            ownerPassword: "password123",
            ownerFullName: "Owner Test",
        });
        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
        token = res.body.token;
    });
    it("login", async () => {
        const res = await request(app)
            .post("/auth/login")
            .set("Authorization", `Bearer ${token}`)
            .send({ email: "owner@test.com", password: "password123" });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});
