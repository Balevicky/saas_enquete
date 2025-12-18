// src/services/respondentResponseService.ts
import api from "../utils/api";
import { Respondent } from "./respondentService";

export interface RespondentAnswer {
  id: string;
  questionId: string;
  questionLabel: string;
  value: any;
}

export interface RespondentResponsePayload {
  respondent: Respondent;
  responses: RespondentAnswer[];
}

const respondentResponseService = {
  getResponses: async (slug: string, respondentId: string) => {
    const res = await api.get<RespondentResponsePayload>(
      `/t/${slug}/respondents/${respondentId}/responses`
    );
    return res.data;
  },
};

export default respondentResponseService;
