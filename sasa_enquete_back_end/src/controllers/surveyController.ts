// src/controllers/survey.controller.ts

import { Request, Response } from "express";
// import { v4 as uuidv4 } from "uuid"; // ✅ import ESM correct
import prisma from "../prisma";
import { generateId } from "../utils/generateId";
import { buildPagination, buildSearchFilter } from "../utils/pagination";
// buildPagination, buildSearchFilter
// ======================================
// CRUD SURVEYS
// ======================================

export async function createSurvey(req: any, res: Response) {
  try {
    const tenantId = req.tenantId;
    const userId = req.user?.userId;
    const { title, json } = req.body;

    const s = await prisma.survey.create({
      data: { title, json, tenantId, createdBy: userId },
    });

    res.status(201).json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur création survey" });
  }
}

export async function updateSurvey(req: any, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const { title, json } = req.body;

    const s = await prisma.survey.findUnique({ where: { id, tenantId } });
    if (!s || s.tenantId !== tenantId)
      return res.status(404).json({ error: "Not found" });

    const updated = await prisma.survey.update({
      where: { id },
      data: { title, json },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur" });
  }
}

export async function getSurvey(req: any, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const s = await prisma.survey.findUnique({ where: { id, tenantId } });
    if (!s || s.tenantId !== tenantId)
      return res.status(404).json({ error: "Not found" });

    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur" });
  }
}
export async function listSurveys(req: any, res: Response) {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant missing" });

    // Pagination
    const { skip, take } = buildPagination(req.query);

    // Search (title)
    const titleFilter = buildSearchFilter(
      req.query.search as string | undefined
    );

    // Filtres avancés
    const { createdBy, status, from, to } = req.query;

    // Filtre date
    const dateFilter =
      from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from as string) }),
              ...(to && { lte: new Date(to as string) }),
            },
          }
        : {};

    const where = {
      tenantId,
      ...(titleFilter && { title: titleFilter }),
      ...(createdBy && { createdBy }),
      ...(status && { status }),
      ...dateFilter,
    };

    const surveys = await prisma.survey.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            respondents: true,
            responses: true,
          },
        },
      },
    });

    const total = await prisma.survey.count({ where });

    return res.json({
      data: surveys,
      meta: {
        total,
        page: Number(req.query.page) || 1,
        perPage: Number(req.query.perPage) || take,
        filters: {
          search: req.query.search || null,
          createdBy: createdBy || null,
          status: status || null,
          from: from || null,
          to: to || null,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur listing surveys" });
  }
}

// export async function listSurveys(req: any, res: Response) {
//   try {
//     const tenantId = req.tenantId;
//     if (!tenantId) return res.status(400).json({ error: "Tenant missing" });

//     // Pagination (même logique que RegionController)
//     const { skip, take } = buildPagination(req.query);

//     // Filtre de recherche (title)
//     const titleFilter = buildSearchFilter(
//       req.query.search as string | undefined
//     );

//     const surveys = await prisma.survey.findMany({
//       where: {
//         tenantId,
//         ...(titleFilter && { title: titleFilter }),
//       },
//       skip,
//       take,
//       orderBy: { createdAt: "desc" },
//       include: {
//         _count: {
//           select: {
//             respondents: true,
//             responses: true,
//           },
//         },
//       },
//     });

//     // Total pour le frontend (pagination)
//     const total = await prisma.survey.count({
//       where: {
//         tenantId,
//         ...(titleFilter && { title: titleFilter }),
//       },
//     });

//     return res.json({
//       data: surveys,
//       meta: {
//         total,
//         page: Number(req.query.page) || 1,
//         perPage: Number(req.query.perPage) || take,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erreur listing surveys" });
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

export async function publishSurvey(req: any, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const s = await prisma.survey.findUnique({ where: { id, tenantId } });
    if (!s || s.tenantId !== tenantId)
      return res.status(404).json({ error: "Survey not found" });

    // Génération d’un publicId
    // const publicId = uuidv4().slice(0, 8);
    // const publicId = nanoid(10);
    const publicId = await generateId(10);
    res.json({ ok: true, publicId });
  } catch (err) {
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
