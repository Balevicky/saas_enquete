import api from "../utils/api";

export const respondentService = {
  list: (slug: string, surveyId: string, params?: any) =>
    api.get(`/t/${slug}/surveys/${surveyId}/respondents`, { params }),

  create: (slug: string, surveyId: string, data: any) =>
    api.post(`/t/${slug}/surveys/${surveyId}/respondents`, data),

  get: (slug: string, id: string) => api.get(`/t/${slug}/respondents/${id}`),

  complete: (slug: string, id: string) =>
    api.post(`/t/${slug}/respondents/${id}/complete`),
};
