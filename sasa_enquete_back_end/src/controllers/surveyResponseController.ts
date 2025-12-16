import { Request, Response } from "express";
import prisma from "../prisma";

export class SurveyResponseController {
  // ======================
  // CREATE FINAL RESPONSE
  // POST /surveys/:surveyId/survey-responses
  // ======================
  static async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { surveyId } = req.params;
      const { answers, meta } = req.body;

      const response = await prisma.surveyResponse.create({
        data: {
          surveyId,
          tenantId,
          answers,
          meta,
        },
      });

      res.status(201).json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur création SurveyResponse" });
    }
  }

  // ======================
  // LIST SURVEY RESPONSES
  // GET /surveys/:surveyId/survey-responses
  // ======================
  static async list(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { surveyId } = req.params;

      const responses = await prisma.surveyResponse.findMany({
        where: { tenantId, surveyId },
        orderBy: { createdAt: "desc" },
      });

      res.json(responses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur listing SurveyResponses" });
    }
  }
}
