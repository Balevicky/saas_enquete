import { Request, Response } from "express";
import prisma from "../prisma";
import { buildPagination, buildSearchFilter } from "../utils/pagination";

function buildQuestionName(position: number, label: string): string {
  const slug = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return `q_${position}_${slug}`;
}
export class QuestionController {
  // ======================
  // CREATE QUESTION
  // POST /surveys/:surveyId/questions
  // ======================
  static async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { surveyId } = req.params;
      const { label, type, position } = req.body;
      console.log("req.body", req.body);
      const name = buildQuestionName(position, label);
      // Vérifier que le survey appartient au tenant
      const survey = await prisma.survey.findFirst({
        where: { id: surveyId, tenantId },
      });
      if (!survey) return res.status(404).json({ error: "Survey not found" });

      // 🚫 MODE ADVANCED
      if (survey.mode === "ADVANCED") {
        return res.status(409).json({
          error: "Questions gérées par Survey Builder",
        });
      }
      const question = await prisma.question.create({
        data: { surveyId, tenantId, label, type, position, name },
      });

      return res.status(201).json(question);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur création question" });
    }
  }

  // ======================
  // LIST QUESTIONS
  // GET /surveys/:surveyId/questions
  // ======================
  static async list(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { surveyId } = req.params;
      const { skip, take } = buildPagination(req.query);
      const labelFilter = buildSearchFilter(req.query.search as string);

      const where: any = { tenantId };
      if (surveyId) where.surveyId = surveyId;
      if (labelFilter) where.label = labelFilter;

      const questions = await prisma.question.findMany({
        where,
        skip,
        take,
        orderBy: { position: "asc" },
      });

      const total = await prisma.question.count({ where });

      return res.json({
        data: questions,
        meta: {
          total,
          page: Number(req.query.page) || 1,
          perPage: Number(req.query.perPage) || take,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur listing questions" });
    }
  }

  // ======================
  // GET ONE QUESTION
  // GET /surveys/:surveyId/questions/:id
  // ======================
  static async get(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { id, surveyId } = req.params;

      const question = await prisma.question.findFirst({
        where: { id, surveyId, tenantId },
      });

      if (!question)
        return res.status(404).json({ error: "Question not found" });

      return res.json(question);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur récupération question" });
    }
  }

  // ======================
  // UPDATE QUESTION
  // PUT /surveys/:surveyId/questions/:id
  // ======================
  static async update(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { id, surveyId } = req.params;
      const { label, type, position } = req.body;

      const existing = await prisma.question.findFirst({
        where: { id, surveyId, tenantId },
      });
      if (!existing)
        return res.status(404).json({ error: "Question not found" });

      const survey = await prisma.survey.findFirst({
        where: { id: surveyId, tenantId },
      });
      if (!survey) return res.status(404).json({ error: "Survey not found" });

      // 🚫 MODE ADVANCED
      if (survey.mode === "ADVANCED") {
        return res.status(409).json({
          error: "Questions gérées par Survey Builder",
        });
      }

      const updated = await prisma.question.update({
        // where: { id },
        where: { id, tenantId, surveyId },
        data: { label, type, position },
      });

      return res.json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur mise à jour question" });
    }
  }

  // ======================
  // DELETE QUESTION
  // DELETE /surveys/:surveyId/questions/:id
  // ======================
  static async remove(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { id, surveyId } = req.params;

      const existing = await prisma.question.findFirst({
        where: { id, surveyId, tenantId },
      });
      if (!existing)
        return res.status(404).json({ error: "Question not found" });

      const survey = await prisma.survey.findFirst({
        where: { id: surveyId, tenantId },
      });
      if (!survey) return res.status(404).json({ error: "Survey not found" });

      // 🚫 MODE ADVANCED
      if (survey.mode === "ADVANCED") {
        return res.status(409).json({
          error: "Questions gérées par Survey Builder",
        });
      }
      await prisma.question.delete({ where: { id } });
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur suppression question" });
    }
  }
}

// // ========================
// import { Request, Response } from "express";
// import prisma from "../prisma";
// import { buildPagination, buildSearchFilter } from "../utils/pagination";

// export class QuestionController {
//   // CREATE
//   static async create(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const { surveyId } = req.params;
//       const { label, type, position } = req.body;
//       // const { surveyId, label, type, position } = req.body;

//       // Vérifier que le survey appartient au tenant
//       const survey = await prisma.survey.findFirst({
//         where: { id: surveyId, tenantId },
//       });
//       if (!survey) return res.status(404).json({ error: "Survey not found" });

//       const question = await prisma.question.create({
//         data: {
//           surveyId,
//           tenantId,
//           label,
//           type,
//           position,
//         },
//       });

//       return res.status(201).json(question);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Erreur création question" });
//     }
//   }

//   // LIST
//   static async list(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const { skip, take } = buildPagination(req.query);
//       const labelFilter = buildSearchFilter(
//         req.query.search as string | undefined
//       );

//       const surveyId = req.query.surveyId as string | undefined;

//       const where: any = { tenantId };
//       if (surveyId) where.surveyId = surveyId;
//       if (labelFilter) where.label = labelFilter;

//       const questions = await prisma.question.findMany({
//         where,
//         skip,
//         take,
//         orderBy: { position: "asc" },
//       });

//       const total = await prisma.question.count({ where });

//       return res.json({
//         data: questions,
//         meta: {
//           total,
//           page: Number(req.query.page) || 1,
//           perPage: Number(req.query.perPage) || take,
//         },
//       });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Erreur listing questions" });
//     }
//   }

//   // GET ONE
//   static async get(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const id = req.params.id;
//       const question = await prisma.question.findFirst({
//         where: { id, tenantId },
//       });
//       if (!question)
//         return res.status(404).json({ error: "Question not found" });
//       return res.json(question);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Erreur récupération question" });
//     }
//   }

//   // UPDATE
//   static async update(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const id = req.params.id;
//       const existing = await prisma.question.findFirst({
//         where: { id, tenantId },
//       });
//       if (!existing)
//         return res.status(404).json({ error: "Question not found" });

//       const { label, type, position } = req.body;

//       const updated = await prisma.question.update({
//         where: { id },
//         data: { label, type, position },
//       });

//       return res.json(updated);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Erreur mise à jour question" });
//     }
//   }

//   // DELETE
//   static async remove(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const id = req.params.id;
//       const existing = await prisma.question.findFirst({
//         where: { id, tenantId },
//       });
//       if (!existing)
//         return res.status(404).json({ error: "Question not found" });

//       await prisma.question.delete({ where: { id } });
//       return res.status(204).send();
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Erreur suppression question" });
//     }
//   }
// }
