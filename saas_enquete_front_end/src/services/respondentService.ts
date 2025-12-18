import api from "../utils/api";

// 🔹 Interface exportée
// export interface Respondent {
//   id: string;
//   name: string;
//   email: string;
//   status: "pending" | "completed";
// }
export interface Respondent {
  id: string;
  name: string;
  firstname?: string;
  birthYear?: number;
  villageId?: string;
  externalId?: string;
  metadata?: any;
  startedAt: string;
  completedAt?: string | null;
}

export const respondentService = {
  list: (slug: string, surveyId: string, params?: any) =>
    api.get(`/t/${slug}/surveys/${surveyId}/respondents`, { params }),

  create: (slug: string, surveyId: string, data: any) =>
    api.post(`/t/${slug}/surveys/${surveyId}/respondents`, data),

  get: (slug: string, id: string) => api.get(`/t/${slug}/respondents/${id}`),

  complete: (slug: string, id: string) =>
    api.post(`/t/${slug}/respondents/${id}/complete`),
};
