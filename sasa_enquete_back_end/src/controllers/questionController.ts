import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
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
      // const { label, type, position, options, config, nextMap } = req.body;

      // 🆕 sectionId autorisé
      const { label, type, position, sectionId, options, config, nextMap } =
        req.body;

      const name = buildQuestionName(position, label);

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

      // ==== VALIDATIONS PHASE B – SIMPLE ====
      if (
        (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") &&
        (!options || options.length === 0)
      ) {
        return res.status(400).json({
          error: "Options obligatoires pour SINGLE_CHOICE / MULTIPLE_CHOICE",
        });
      }

      if (nextMap && type !== "SINGLE_CHOICE") {
        return res.status(400).json({
          error: "Conditionnel SIMPLE autorisé uniquement pour SINGLE_CHOICE",
        });
      }

      if (nextMap && options) {
        for (const key of Object.keys(nextMap)) {
          if (!options.includes(key)) {
            return res.status(400).json({
              error: `Condition invalide : ${key} n'est pas une option`,
            });
          }
        }
      }

      const question = await prisma.question.create({
        data: {
          surveyId,
          tenantId,
          sectionId, // 🆕 rattachement à une section
          label,
          type,
          position,
          name,
          options,
          config,
          nextMap,
        },
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
        // orderBy: { position: "asc" },
        // 🆕 TRI STRUCTURÉ :
        // 1️⃣ section.position (ordre des blocs)
        // 2️⃣ question.position (ordre interne au bloc)
        orderBy: [{ section: { position: "asc" } }, { position: "asc" }],

        // 🆕 utile pour debug / frontend
        include: {
          section: true,
        },
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
      // const { label, type, position, options, config, nextMap } = req.body;

      // 🆕 sectionId accepté
      const { label, type, position, sectionId, options, config, nextMap } =
        req.body;

      console.log("req.body", req.body);

      const existing = await prisma.question.findFirst({
        where: { id, surveyId, tenantId },
      });
      if (!existing)
        return res.status(404).json({ error: "Question not found" });

      const survey = await prisma.survey.findFirst({
        where: { id: surveyId, tenantId },
      });
      if (!survey) return res.status(404).json({ error: "Survey not found" });

      if (survey.mode === "ADVANCED") {
        return res.status(409).json({
          error: "Questions gérées par Survey Builder",
        });
      }

      // ==== VALIDATIONS PHASE B – SIMPLE ====
      if (
        (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") &&
        (!options || options.length === 0)
      ) {
        return res.status(400).json({
          error: "Options obligatoires pour SINGLE_CHOICE / MULTIPLE_CHOICE",
        });
      }

      if (nextMap && type !== "SINGLE_CHOICE") {
        return res.status(400).json({
          error: "Conditionnel SIMPLE autorisé uniquement pour SINGLE_CHOICE",
        });
      }

      if (nextMap && options) {
        for (const key of Object.keys(nextMap)) {
          if (!options.includes(key)) {
            return res.status(400).json({
              error: `Condition invalide : ${key} n'est pas une option`,
            });
          }
        }
      }

      const updated = await prisma.question.update({
        where: { id, tenantId, surveyId },
        data: {
          label,
          type,
          position,
          sectionId, // 🆕 déplacement inter-section possible
          options,
          config,
          nextMap,
        },
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
      const { id: deletedId, surveyId } = req.params;

      // 1️⃣ Vérifier existence
      const existing = await prisma.question.findFirst({
        where: { id: deletedId, surveyId, tenantId },
        select: {
          id: true,
          sectionId: true, // 🆕 très important
        },
      });

      if (!existing) {
        return res.status(404).json({ error: "Question not found" });
      }
      const sectionId = existing.sectionId; // 🆕 très important

      // 2️⃣ Nettoyer les nextMap qui pointent vers la question supprimée
      const questionsWithNextMap = await prisma.question.findMany({
        where: {
          surveyId,
          tenantId,
          nextMap: { not: Prisma.DbNull },
        },
      });

      for (const q of questionsWithNextMap) {
        if (!q.nextMap) continue;

        const cleanedNextMap = Object.fromEntries(
          Object.entries(q.nextMap as Record<string, string>).filter(
            ([_, targetId]) => targetId !== deletedId
          )
        );

        if (JSON.stringify(cleanedNextMap) !== JSON.stringify(q.nextMap)) {
          await prisma.question.update({
            where: { id: q.id },
            data: { nextMap: cleanedNextMap },
          });
        }
      }

      // 3️⃣ Supprimer la question
      await prisma.question.delete({
        where: { id: deletedId },
      });

      // 4️⃣ 🔥 Réordonner automatiquement les positions
      const remainingQuestions = await prisma.question.findMany({
        where: {
          surveyId,
          tenantId,
          // 🆕 uniquement la même section
          ...(sectionId ? { sectionId } : { sectionId: null }), // fallback sécurité
        },
        // orderBy: { position: "asc" },
        orderBy: { position: "asc" },
      });

      // 5️⃣ Réassigner les positions (1, 2, 3…)

      for (let i = 0; i < remainingQuestions.length; i++) {
        const q = remainingQuestions[i];
        const newPosition = i + 1;

        if (q.position !== newPosition) {
          await prisma.question.update({
            where: { id: q.id },
            data: { position: newPosition },
          });
        }
      }

      // return res.status(204).send();
      return res.status(200).json({ message: "Suppression effectuée" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error:
          "Erreur suppression question + nettoyage nextMap + réorganisation positions",
      });
    }
  }
  // ============================================== bon
  // static async remove(req: Request, res: Response) {
  //   try {
  //     const tenantId = (req as any).tenantId;
  //     const { id: deletedId, surveyId } = req.params;

  //     // 1️⃣ Vérifier existence
  //     const existing = await prisma.question.findFirst({
  //       where: { id: deletedId, surveyId, tenantId },
  //     });

  //     if (!existing) {
  //       return res.status(404).json({ error: "Question not found" });
  //     }

  //     // 2️⃣ Trouver les questions ayant un nextMap
  //     const questionsWithNextMap = await prisma.question.findMany({
  //       where: {
  //         surveyId,
  //         tenantId,
  //         nextMap: { not: Prisma.DbNull }, // ✅ CORRECT
  //       },
  //     });

  //     // 3️⃣ Nettoyer les nextMap
  //     for (const q of questionsWithNextMap) {
  //       if (!q.nextMap) continue;

  //       const cleanedNextMap = Object.fromEntries(
  //         Object.entries(q.nextMap as Record<string, string>).filter(
  //           ([_, targetId]) => targetId !== deletedId
  //         )
  //       );

  //       // Mise à jour seulement si modification réelle
  //       if (JSON.stringify(cleanedNextMap) !== JSON.stringify(q.nextMap)) {
  //         await prisma.question.update({
  //           where: { id: q.id },
  //           data: {
  //             nextMap: cleanedNextMap, // ✅ jamais null
  //           },
  //         });
  //       }
  //     }

  //     // 4️⃣ Supprimer la question
  //     await prisma.question.delete({
  //       where: { id: deletedId },
  //     });

  //     return res.status(204).send();
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).json({
  //       error: "Erreur suppression question + nettoyage nextMap",
  //     });
  //   }
  // }
  // static async remove(req: Request, res: Response) {
  //   try {
  //     const tenantId = (req as any).tenantId;
  //     const { id: deletedId, surveyId } = req.params;

  //     // 1️⃣ Vérifier existence
  //     const existing = await prisma.question.findFirst({
  //       where: { id: deletedId, surveyId, tenantId },
  //     });
  //     if (!existing)
  //       return res.status(404).json({ error: "Question not found" });

  //     // 2️⃣ Trouver les questions avec nextMap
  //     const questionsWithNextMap = await prisma.question.findMany({
  //       where: {
  //         surveyId,
  //         tenantId,
  //         nextMap: { not: Prisma.DbNull }, // ✅ CORRECT
  //       },
  //     });

  //     // 3️⃣ Nettoyer les nextMap
  //     for (const q of questionsWithNextMap) {
  //       if (!q.nextMap) continue;

  //       const cleanedNextMap = Object.fromEntries(
  //         Object.entries(q.nextMap).filter(
  //           ([_, targetId]) => targetId !== deletedId
  //         )
  //       );

  //       // Mise à jour uniquement si changement
  //       if (JSON.stringify(cleanedNextMap) !== JSON.stringify(q.nextMap)) {
  //         await prisma.question.update({
  //           where: { id: q.id },
  //           data: { nextMap: cleanedNextMap },
  //         });
  //       }
  //     }

  //     // 4️⃣ Supprimer la question
  //     await prisma.question.delete({
  //       where: { id: deletedId },
  //     });

  //     return res.status(204).send();
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).json({
  //       error: "Erreur suppression question + nettoyage nextMap",
  //     });
  //   }
  // }

  // static async remove(req: Request, res: Response) {
  //   try {
  //     const tenantId = (req as any).tenantId;
  //     const { id, surveyId } = req.params;

  //     const existing = await prisma.question.findFirst({
  //       where: { id, surveyId, tenantId },
  //     });
  //     if (!existing)
  //       return res.status(404).json({ error: "Question not found" });

  //     const survey = await prisma.survey.findFirst({
  //       where: { id: surveyId, tenantId },
  //     });
  //     if (!survey) return res.status(404).json({ error: "Survey not found" });

  //     if (survey.mode === "ADVANCED") {
  //       return res.status(409).json({
  //         error: "Questions gérées par Survey Builder",
  //       });
  //     }

  //     await prisma.question.delete({ where: { id } });
  //     return res.status(204).send();
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).json({ error: "Erreur suppression question" });
  //   }
  // }
  // ======================
  // REORDER QUESTION (Drag & Drop)
  // POST /surveys/:surveyId/questions/:id/reorder
  // ======================
  // static async reorder(req: Request, res: Response) {
  //   try {
  //     const tenantId = (req as any).tenantId;
  //     const { surveyId, id: questionId } = req.params;
  //     const { sourceSectionId, targetSectionId, targetPosition } = req.body;

  //     if (targetPosition < 1)
  //       return res.status(400).json({ error: "Position invalide" });

  //     // 1️⃣ Vérifier que la question existe
  //     const question = await prisma.question.findFirst({
  //       where: { id: questionId, surveyId, tenantId },
  //     });
  //     if (!question)
  //       return res.status(404).json({ error: "Question introuvable" });

  //     // 2️⃣ Transaction pour sécurité
  //     await prisma.$transaction(async (tx) => {
  //       // 🔹 Réorganiser section source (décrémenter positions > ancienne position)
  //       if (sourceSectionId !== null) {
  //         const sourceQuestions = await tx.question.findMany({
  //           where: {
  //             surveyId,
  //             tenantId,
  //             sectionId: sourceSectionId,
  //             position: { gt: question.position },
  //           },
  //         });

  //         for (const q of sourceQuestions) {
  //           await tx.question.update({
  //             where: { id: q.id },
  //             data: { position: q.position - 1 },
  //           });
  //         }
  //       }

  //       // 🔹 Réorganiser section cible (incrémenter positions >= targetPosition)
  //       const targetQuestions = await tx.question.findMany({
  //         where: {
  //           surveyId,
  //           tenantId,
  //           sectionId: targetSectionId,
  //           position: { gte: targetPosition },
  //         },
  //       });

  //       for (const q of targetQuestions) {
  //         await tx.question.update({
  //           where: { id: q.id },
  //           data: { position: q.position + 1 },
  //         });
  //       }

  //       // 🔹 Mettre à jour la question déplacée
  //       await tx.question.update({
  //         where: { id: questionId },
  //         data: {
  //           sectionId: targetSectionId,
  //           position: targetPosition,
  //         },
  //       });
  //     });

  //     return res
  //       .status(200)
  //       .json({ message: "Question réordonnée avec succès" });
  //   } catch (err) {
  //     console.error(err);
  //     return res
  //       .status(500)
  //       .json({ error: "Erreur lors du déplacement de la question" });
  //   }
  // }//changer le 22/12/2015
  // ====================
  // static async reorder(req: Request, res: Response) {
  //   try {
  //     const tenantId = (req as any).tenantId;
  //     const { surveyId, id: questionId } = req.params;
  //     const { sourceSectionId, targetSectionId, targetPosition } = req.body;
  //     console.log("req.body", req.body);

  //     if (targetPosition < 1) {
  //       return res.status(400).json({ error: "Position invalide" });
  //     }

  //     // 1️⃣ Vérifier que la question existe
  //     const question = await prisma.question.findFirst({
  //       where: { id: questionId, surveyId, tenantId },
  //     });

  //     if (!question) {
  //       return res.status(404).json({ error: "Question introuvable" });
  //     }

  //     await prisma.$transaction(async (tx) => {
  //       const sourceSectionKey = sourceSectionId ?? null;
  //       const targetSectionKey = targetSectionId ?? null;

  //       // 2️⃣ Charger les questions source
  //       const sourceQuestions = await tx.question.findMany({
  //         where: {
  //           surveyId,
  //           tenantId,
  //           sectionId: sourceSectionKey,
  //         },
  //         orderBy: { position: "asc" },
  //       });
  //       console.log("sourceQuestions", sourceQuestions);

  //       // 3️⃣ Charger les questions cible (si différente)
  //       const targetQuestions =
  //         sourceSectionKey === targetSectionKey
  //           ? sourceQuestions
  //           : await tx.question.findMany({
  //               where: {
  //                 surveyId,
  //                 tenantId,
  //                 sectionId: targetSectionKey,
  //               },
  //               orderBy: { position: "asc" },
  //             });
  //       console.log("targetQuestions", targetQuestions);

  //       // 4️⃣ Retirer la question de la source
  //       const filteredSource = sourceQuestions.filter(
  //         (q) => q.id !== questionId
  //       );

  //       // 5️⃣ Insérer dans la cible à la bonne position
  //       const insertIndex = Math.min(
  //         Math.max(targetPosition - 1, 0),
  //         targetQuestions.length
  //       );

  //       const updatedTarget = [...targetQuestions];
  //       updatedTarget.splice(insertIndex, 0, {
  //         ...question,
  //         sectionId: targetSectionKey,
  //       });

  //       // 6️⃣ Réassigner positions SOURCE
  //       for (let i = 0; i < filteredSource.length; i++) {
  //         await tx.question.update({
  //           where: { id: filteredSource[i].id },
  //           data: { position: i + 1 },
  //         });
  //       }

  //       // 7️⃣ Réassigner positions TARGET
  //       for (let i = 0; i < updatedTarget.length; i++) {
  //         await tx.question.update({
  //           where: { id: updatedTarget[i].id },
  //           data: {
  //             sectionId: targetSectionKey,
  //             position: i + 1,
  //           },
  //         });
  //       }
  //     });

  //     return res
  //       .status(200)
  //       .json({ message: "Question réordonnée avec succès" });
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).json({
  //       error: "Erreur lors du déplacement de la question",
  //     });
  //   }
  // }// pas bon
  //  =================
  static async reorder(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { surveyId, id: questionId } = req.params;
      const { sourceSectionId, targetSectionId, targetPosition } = req.body;

      if (targetPosition < 1) {
        return res.status(400).json({ error: "Position invalide" });
      }

      // 1️⃣ Vérifier que la question existe
      const question = await prisma.question.findFirst({
        where: { id: questionId, surveyId, tenantId },
      });

      if (!question) {
        return res.status(404).json({ error: "Question introuvable" });
      }

      await prisma.$transaction(async (tx) => {
        const sourceSectionKey = sourceSectionId ?? null;
        const targetSectionKey = targetSectionId ?? null;

        // 2️⃣ Charger TOUTES les questions source (ordonnées)
        const sourceQuestions = await tx.question.findMany({
          where: {
            surveyId,
            tenantId,
            sectionId: sourceSectionKey,
          },
          orderBy: { position: "asc" },
        });

        // 3️⃣ Retirer la question déplacée de la source
        const cleanedSource = sourceQuestions.filter(
          (q) => q.id !== questionId
        );

        // 4️⃣ Charger les questions cible (SANS la question)
        const targetQuestions =
          sourceSectionKey === targetSectionKey
            ? cleanedSource
            : (
                await tx.question.findMany({
                  where: {
                    surveyId,
                    tenantId,
                    sectionId: targetSectionKey,
                  },
                  orderBy: { position: "asc" },
                })
              ).filter((q) => q.id !== questionId);

        // 5️⃣ Calculer l’index d’insertion sécurisé
        const insertIndex = Math.min(
          Math.max(targetPosition - 1, 0),
          targetQuestions.length
        );

        // 6️⃣ Construire la nouvelle liste cible
        const updatedTarget = [...targetQuestions];
        updatedTarget.splice(insertIndex, 0, {
          ...question,
          sectionId: targetSectionKey,
        });

        // 7️⃣ Réassigner positions SOURCE (1..N)
        for (let i = 0; i < cleanedSource.length; i++) {
          await tx.question.update({
            where: { id: cleanedSource[i].id },
            data: { position: i + 1 },
          });
        }

        // 8️⃣ Réassigner positions TARGET (1..N)
        for (let i = 0; i < updatedTarget.length; i++) {
          await tx.question.update({
            where: { id: updatedTarget[i].id },
            data: {
              sectionId: targetSectionKey,
              position: i + 1,
            },
          });
        }
      });

      return res.status(200).json({
        message: "Question réordonnée avec succès",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Erreur lors du déplacement de la question",
      });
    }
  }
}

// =================================
// import { Request, Response } from "express";
// import prisma from "../prisma";
// import { buildPagination, buildSearchFilter } from "../utils/pagination";

// function buildQuestionName(position: number, label: string): string {
//   const slug = label
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_|_$/g, "");

//   return `q_${position}_${slug}`;
// }
// export class QuestionController {
//   // ======================
//   // CREATE QUESTION
//   // POST /surveys/:surveyId/questions
//   // ======================
//   static async create(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const { surveyId } = req.params;
//       const { label, type, position } = req.body;
//       console.log("req.body", req.body);
//       const name = buildQuestionName(position, label);
//       // Vérifier que le survey appartient au tenant
//       const survey = await prisma.survey.findFirst({
//         where: { id: surveyId, tenantId },
//       });
//       if (!survey) return res.status(404).json({ error: "Survey not found" });

//       // 🚫 MODE ADVANCED
//       if (survey.mode === "ADVANCED") {
//         return res.status(409).json({
//           error: "Questions gérées par Survey Builder",
//         });
//       }
//       const question = await prisma.question.create({
//         data: { surveyId, tenantId, label, type, position, name },
//       });

//       return res.status(201).json(question);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Erreur création question" });
//     }
//   }

//   // ======================
//   // LIST QUESTIONS
//   // GET /surveys/:surveyId/questions
//   // ======================
//   static async list(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const { surveyId } = req.params;
//       const { skip, take } = buildPagination(req.query);
//       const labelFilter = buildSearchFilter(req.query.search as string);

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

//   // ======================
//   // GET ONE QUESTION
//   // GET /surveys/:surveyId/questions/:id
//   // ======================
//   static async get(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const { id, surveyId } = req.params;

//       const question = await prisma.question.findFirst({
//         where: { id, surveyId, tenantId },
//       });

//       if (!question)
//         return res.status(404).json({ error: "Question not found" });

//       return res.json(question);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Erreur récupération question" });
//     }
//   }

//   // ======================
//   // UPDATE QUESTION
//   // PUT /surveys/:surveyId/questions/:id
//   // ======================
//   static async update(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const { id, surveyId } = req.params;
//       const { label, type, position } = req.body;

//       const existing = await prisma.question.findFirst({
//         where: { id, surveyId, tenantId },
//       });
//       if (!existing)
//         return res.status(404).json({ error: "Question not found" });

//       const survey = await prisma.survey.findFirst({
//         where: { id: surveyId, tenantId },
//       });
//       if (!survey) return res.status(404).json({ error: "Survey not found" });

//       // 🚫 MODE ADVANCED
//       if (survey.mode === "ADVANCED") {
//         return res.status(409).json({
//           error: "Questions gérées par Survey Builder",
//         });
//       }

//       const updated = await prisma.question.update({
//         // where: { id },
//         where: { id, tenantId, surveyId },
//         data: { label, type, position },
//       });

//       return res.json(updated);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Erreur mise à jour question" });
//     }
//   }

//   // ======================
//   // DELETE QUESTION
//   // DELETE /surveys/:surveyId/questions/:id
//   // ======================
//   static async remove(req: Request, res: Response) {
//     try {
//       const tenantId = (req as any).tenantId;
//       const { id, surveyId } = req.params;

//       const existing = await prisma.question.findFirst({
//         where: { id, surveyId, tenantId },
//       });
//       if (!existing)
//         return res.status(404).json({ error: "Question not found" });

//       const survey = await prisma.survey.findFirst({
//         where: { id: surveyId, tenantId },
//       });
//       if (!survey) return res.status(404).json({ error: "Survey not found" });

//       // 🚫 MODE ADVANCED
//       if (survey.mode === "ADVANCED") {
//         return res.status(409).json({
//           error: "Questions gérées par Survey Builder",
//         });
//       }
//       await prisma.question.delete({ where: { id } });
//       return res.status(204).send();
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Erreur suppression question" });
//     }
//   }
// }

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
