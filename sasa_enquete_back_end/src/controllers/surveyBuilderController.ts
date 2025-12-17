import { Request, Response } from "express";
import prisma from "../prisma";
import SurveyBuilderService from "../services/surveyBuilderService";

export class SurveyBuilderController {
  // ======================
  // UPDATE SURVEY BUILDER JSON + SYNC QUESTIONS
  // PUT /t/:slug/surveys/:id/builder
  // ======================
  static async updateBuilder(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { id } = req.params;
      const { json } = req.body;

      // Vérifier que le survey existe et appartient au tenant
      const survey = await prisma.survey.findFirst({ where: { id, tenantId } });
      if (!survey) return res.status(404).json({ error: "Survey not found" });

      // Mettre à jour le JSON du survey
      const updatedSurvey = await prisma.survey.update({
        where: { id },
        data: { json, mode: "ADVANCED" }, // On force le mode ADVANCED pour ce flux
      });

      // Appeler le service qui parse le JSON et synchronise les questions
      // await SurveyBuilderService.syncQuestions(survey.id, tenantId, json);
      await SurveyBuilderService.saveSurveyBuilder(survey.id, tenantId, json);

      return res.json({
        ok: true,
        survey: updatedSurvey,
        message: "Survey JSON mis à jour et questions synchronisées",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur update survey builder" });
    }
  }
}
