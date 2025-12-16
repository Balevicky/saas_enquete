import request from "supertest";
import app from "../app";
describe("Invite API", () => {
    let token;
    beforeAll(async () => {
        // login ou signup pour obtenir token
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "owner@test.com", password: "password123" });
        token = res.body.token;
    });
    it("create invite", async () => {
        const res = await request(app)
            .post("/invite")
            .set("Authorization", `Bearer ${token}`)
            .send({ email: "user1@test.com" });
        expect(res.status).toBe(201);
        expect(res.body.invite).toBeDefined();
    });
});
