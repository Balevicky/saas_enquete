import request from "supertest";
import app from "../app";

describe("Geo API", () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "owner@test.com", password: "password123" });
    token = res.body.token;
  });
  // Region
  it("create region", async () => {
    const res = await request(app)
      .post("/geo/regions")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Region Test" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Region Test");
  });

  it("list regions", async () => {
    const res = await request(app)
      .get("/geo/regions")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Departement
  it("create departement", async () => {
    const res = await request(app)
      .post("/geo/departements")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Departement Test" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Departement Test");
  });

  it("list departements", async () => {
    const res = await request(app)
      .get("/geo/departements")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  // Secteur
  it("create secteurs", async () => {
    const res = await request(app)
      .post("/geo/secteurs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Secteur Test" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Secteur Test");
  });

  it("list secteurs", async () => {
    const res = await request(app)
      .get("/geo/secteurts")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  // Village
  it("create village", async () => {
    const res = await request(app)
      .post("/geo/villages")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Village Test" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Village Test");
  });

  it("list villages", async () => {
    const res = await request(app)
      .get("/geo/villages")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Ajouter tests pour Departement, Secteur, Village suivant la même logique
});
