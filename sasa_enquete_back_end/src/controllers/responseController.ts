// backend/src/controllers/ResponseController.ts
import { Request, Response } from "express";
import prisma from "../prisma";

export class ResponseController {
  /**
   * Crée ou met à jour toutes les réponses d'un respondent en une seule requête
   * POST /t/:slug/respondents/:respondentId/responses
   */
  static async saveOrUpdateAll(req: Request, res: Response) {
    try {
      const { respondentId } = req.params;
      const { answers } = req.body;
      const tenantId = (req as any).tenantId;
      // answers = [{ questionId, answer }, ...]

      if (!respondentId || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ message: "Payload invalide" });
      }

      // Transaction Prisma pour créer ou mettre à jour chaque réponse
      const savedResponses = await prisma.$transaction(
        answers.map((a) =>
          prisma.response.upsert({
            where: {
              respondentId_questionId_tenantId: {
                // clé unique combinée à définir dans Prisma
                respondentId,
                questionId: a.questionId,
                tenantId,
              },
            },
            update: {
              answer: a.answer,
            },
            create: {
              respondentId,
              tenantId,
              questionId: a.questionId,
              answer: a.answer,
            },
          })
        )
      );

      res.status(200).json({
        message:
          "Toutes les réponses ont été créées ou mises à jour avec succès",
        data: savedResponses,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde/mise à jour des réponses :",
        error
      );
      res.status(500).json({ message: "Échec de l'opération" });
    }
  }
}

// =======================================
// import { Request, Response } from "express";
// import prisma from "../prisma";

// export class ResponseController {
//   // ======================
//   // SAVE ANSWER
//   // POST /respondents/:respondentId/responses
//   // ======================
//   static async save(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const { respondentId } = req.params;
//       const { questionId, answer } = req.body;

//       const response = await prisma.response.upsert({
//         where: {
//           respondentId_questionId_tenantId: {
//             respondentId,
//             questionId,
//             tenantId,
//           },
//         },
//         update: { answer },
//         create: {
//           respondentId,
//           questionId,
//           tenantId,
//           answer,
//         },
//       });

//       res.status(201).json(response);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Erreur sauvegarde réponse" });
//     }
//   }
// }
