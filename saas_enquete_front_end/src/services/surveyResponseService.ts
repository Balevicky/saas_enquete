import api from "../utils/api";

export const surveyResponseService = {
  list: (slug: string, surveyId: string) =>
    api.get(`/t/${slug}/surveys/${surveyId}/survey-responses`),

  create: (slug: string, surveyId: string, data: any) =>
    api.post(`/t/${slug}/surveys/${surveyId}/survey-responses`, data),
};
