import { Request, Response } from "express";
import prisma from "../prisma";

export class ResponseController {
  // ======================
  // SAVE ANSWER
  // POST /respondents/:respondentId/responses
  // ======================
  static async save(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { respondentId } = req.params;
      const { questionId, answer } = req.body;

      const response = await prisma.response.upsert({
        where: {
          respondentId_questionId_tenantId: {
            respondentId,
            questionId,
            tenantId,
          },
        },
        update: { answer },
        create: {
          respondentId,
          questionId,
          tenantId,
          answer,
        },
      });

      res.status(201).json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur sauvegarde réponse" });
    }
  }
}
