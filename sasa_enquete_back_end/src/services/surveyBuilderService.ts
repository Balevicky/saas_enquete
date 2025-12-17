// backend/src/services/surveyBuilder.service.ts
import prisma from "../prisma";
import { QuestionType } from "@prisma/client";

export class SurveyBuilderService {
  /**
   * Sauvegarde le JSON SurveyJS et synchronise les questions
   * @param surveyId - ID du survey
   * @param tenantId - ID du tenant
   * @param surveyJson - JSON SurveyJS complet
   */
  static async saveSurveyBuilder(
    surveyId: string,
    tenantId: string,
    surveyJson: any
  ) {
    // 1️⃣ Sauvegarder le JSON complet dans Survey
    await prisma.survey.update({
      where: { id: surveyId },
      data: { json: surveyJson },
    });

    // 2️⃣ Extraire toutes les questions du JSON
    const questions = this.flattenSurveyQuestions(surveyJson);

    // 3️⃣ Sync questions dans la DB
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      await prisma.question.upsert({
        where: {
          surveyId_name_tenantId: {
            surveyId,
            name: q.name,
            tenantId,
          },
        },
        update: {
          label: q.title || q.name,
          type: this.mapSurveyTypeToEnum(q),
          position: i + 1,
        },
        create: {
          surveyId,
          tenantId,
          name: q.name,
          label: q.title || q.name,
          type: this.mapSurveyTypeToEnum(q),
          position: i + 1,
        },
      });
    }
  }

  /**
   * Convertit un objet question SurveyJS en enum QuestionType Prisma
   */
  static mapSurveyTypeToEnum(q: any): QuestionType {
    switch (q.type) {
      case "text":
        if (q.inputType === "email") return QuestionType.EMAIL;
        if (q.inputType === "tel") return QuestionType.PHONE;
        if (q.inputType === "textarea") return QuestionType.TEXTAREA;
        return QuestionType.TEXT;

      case "comment":
        return QuestionType.TEXTAREA;

      case "checkbox":
        return QuestionType.MULTIPLE_CHOICE;

      case "radiogroup":
      case "dropdown":
        if (q.multiSelect) return QuestionType.MULTIPLE_CHOICE;
        return QuestionType.SINGLE_CHOICE;

      case "rating":
        return QuestionType.SCALE;

      case "number":
        return QuestionType.NUMBER;

      case "date":
        return QuestionType.DATE;

      default:
        return QuestionType.TEXT; // fallback
    }
  }

  /**
   * Récupère toutes les questions de manière "flatten" (y compris panels)
   */
  static flattenSurveyQuestions(json: any): any[] {
    let result: any[] = [];

    const extract = (elements: any[]) => {
      elements.forEach((el) => {
        if (el.type === "panel" && el.elements) {
          extract(el.elements);
        } else {
          if (el.name) result.push(el);
        }
      });
    };

    if (json.pages && Array.isArray(json.pages)) {
      json.pages.forEach((page: any) => {
        if (page.elements) extract(page.elements);
      });
    }

    return result;
  }
}

export default SurveyBuilderService;
