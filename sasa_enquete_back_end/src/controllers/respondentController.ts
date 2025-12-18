import { Request, Response } from "express";
import prisma from "../prisma";
import { buildPagination } from "../utils/pagination";

export class RespondentController {
  // ======================
  // CREATE RESPONDENT
  // POST /surveys/:surveyId/respondents
  // ======================
  static async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { surveyId } = req.params;
      console.log("surveyId", surveyId);
      console.log(" req.body", req.body);

      const { name, firstname, birthYear, villageId, externalId, metadata } =
        req.body;

      const respondent = await prisma.respondent.create({
        data: {
          surveyId,
          tenantId,
          name,
          firstname,
          birthYear,
          villageId,
          externalId,
          metadata,
          startedAt: new Date(),
        },
      });

      res.status(201).json(respondent);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur création respondent" });
    }
  }

  // ======================
  // LIST RESPONDENTS
  // GET /surveys/:surveyId/respondents
  // ======================
  static async list(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { surveyId } = req.params;
      const { skip, take } = buildPagination(req.query);

      const respondents = await prisma.respondent.findMany({
        where: { tenantId, surveyId },
        skip,
        take,
        orderBy: { startedAt: "desc" },
      });

      const total = await prisma.respondent.count({
        where: { tenantId, surveyId },
      });

      res.json({ data: respondents, total });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur listing respondents" });
    }
  }

  // ======================
  // GET RESPONDENT + RESPONSES
  // GET /respondents/:id
  // ======================
  static async get(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { id } = req.params;

      const respondent = await prisma.respondent.findFirst({
        where: { id, tenantId },
        include: {
          responses: {
            include: { question: true },
          },
        },
      });

      if (!respondent)
        return res.status(404).json({ error: "Respondent not found" });

      res.json(respondent);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur récupération respondent" });
    }
  }

  // ======================
  // COMPLETE RESPONDENT
  // POST /respondents/:id/complete
  // ======================
  static async complete(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { id } = req.params;

      const respondent = await prisma.respondent.updateMany({
        where: { id, tenantId },
        data: { completedAt: new Date() },
      });

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur clôture respondent" });
    }
  }
}
