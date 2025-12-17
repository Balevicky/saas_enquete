// src/services/surveyAnalysisService.ts

import api from "../utils/api";
import { SurveyAnalysisResult } from "../types/surveyAnalysis";

export const surveyAnalysisService = {
  getSurveyAnalysis(
    surveyId: string,
    params?: { compareBy?: string[] }
  ): Promise<SurveyAnalysisResult> {
    return api.get(`/surveys/${surveyId}/analysis`, {
      params: {
        compareBy: params?.compareBy?.join(","),
      },
    });
  },
};

export default surveyAnalysisService;
