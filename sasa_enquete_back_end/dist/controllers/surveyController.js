// src/controllers/survey.controller.ts
import { v4 as uuidv4 } from "uuid"; // ✅ import ESM correct
import prisma from "../prisma";
// ======================================
// CRUD SURVEYS
// ======================================
export async function createSurvey(req, res) {
    try {
        const tenantId = req.tenantId;
        const userId = req.user?.userId;
        const { title, json } = req.body;
        const s = await prisma.survey.create({
            data: { title, json, tenantId, createdBy: userId },
        });
        res.status(201).json(s);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur création survey" });
    }
}
export async function updateSurvey(req, res) {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId;
        const { title, json } = req.body;
        const s = await prisma.survey.findUnique({ where: { id } });
        if (!s || s.tenantId !== tenantId)
            return res.status(404).json({ error: "Not found" });
        const updated = await prisma.survey.update({
            where: { id },
            data: { title, json },
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur" });
    }
}
export async function getSurvey(req, res) {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId;
        const s = await prisma.survey.findUnique({ where: { id } });
        if (!s || s.tenantId !== tenantId)
            return res.status(404).json({ error: "Not found" });
        res.json(s);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur" });
    }
}
export async function listSurveys(req, res) {
    try {
        const tenantId = req.tenantId;
        const { skip, limit } = req.pagination || { skip: 0, limit: 10 };
        const search = String(req.query.search || "");
        const where = { tenantId };
        if (search)
            where.title = { contains: search, mode: "insensitive" };
        const [data, total] = await Promise.all([
            prisma.survey.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.survey.count({ where }),
        ]);
        res.json({ data, pagination: { total } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur" });
    }
}
export async function publishSurvey(req, res) {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId;
        const s = await prisma.survey.findUnique({ where: { id } });
        if (!s || s.tenantId !== tenantId)
            return res.status(404).json({ error: "Survey not found" });
        // Génération d’un publicId
        const publicId = uuidv4().slice(0, 8);
        res.json({ ok: true, publicId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur" });
    }
}
// =================================================
// src/controllers/survey.controller.ts
// src/controllers/survey.controller.ts
// src/controllers/survey.controller.ts
// import { Request, Response } from "express";
// import { v4 as uuidv4 } from "uuid";
// import { v4 as uuidv4 } from "uuid";
// // import { PrismaClient } from "@prisma/client";
// import prisma from "../prisma";
// // import type { Survey } from "@shared/types";
// const newId = uuidv4();
// // const prisma = new PrismaClient();
// export async function createSurvey(req: any, res: Response) {
//   try {
//     const tenantId = req.tenantId;
//     const userId = req.user?.userId;
//     const { title, json } = req.body;
//     const s = await prisma.survey.create({
//       // data: { title, json, tenantId, createdBy: userId },
//       data: { title, json, tenantId, createdBy: userId },
//     });
//     res.status(201).json(s);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erreur création survey" });
//   }
// }
// export async function updateSurvey(req: any, res: Response) {
//   try {
//     const { id } = req.params;
//     const tenantId = req.tenantId;
//     const { title, json } = req.body;
//     const s = await prisma.survey.findUnique({ where: { id } });
//     if (!s || s.tenantId !== tenantId)
//       return res.status(404).json({ error: "Not found" });
//     const updated = await prisma.survey.update({
//       where: { id },
//       data: { title, json },
//     });
//     res.json(updated);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erreur" });
//   }
// }
// export async function getSurvey(req: any, res: Response) {
//   try {
//     const { id } = req.params;
//     const tenantId = req.tenantId;
//     const s = await prisma.survey.findUnique({ where: { id } });
//     if (!s || s.tenantId !== tenantId)
//       return res.status(404).json({ error: "Not found" });
//     res.json(s);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erreur" });
//   }
// }
// export async function listSurveys(req: any, res: Response) {
//   try {
//     const tenantId = req.tenantId;
//     const { skip, limit } = req.pagination || { skip: 0, limit: 10 };
//     const search = String(req.query.search || "");
//     const where: any = { tenantId };
//     if (search) where.title = { contains: search, mode: "insensitive" };
//     const [data, total] = await Promise.all([
//       prisma.survey.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { createdAt: "desc" },
//       }),
//       prisma.survey.count({ where }),
//     ]);
//     res.json({ data, pagination: { total } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erreur" });
//   }
// }
// export async function publishSurvey(req: any, res: Response) {
//   try {
//     const { id } = req.params;
//     const tenantId = req.tenantId;
//     const s = await prisma.survey.findUnique({ where: { id } });
//     if (!s || s.tenantId !== tenantId)
//       return res.status(404).json({ error: "Survey not found" });
//     // create publicId field if desired; for now just return a short token
//     const publicId = uuidv4().slice(0, 8);
//     // optionally store publicId in a new table; omitted for brevity
//     res.json({ ok: true, publicId });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erreur" });
//   }
// }
