import api from "../utils/api";

export type QuestionType = "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN";

export interface Question {
  id: string;
  surveyId: string;
  label: string;
  type: QuestionType;
  position: number;
}

export interface QuestionListResponse {
  data: Question[];
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
}

const questionService = {
  list: async (
    tenantSlug: string,
    surveyId: string,
    params?: any
  ): Promise<QuestionListResponse> => {
    const res = await api.get<QuestionListResponse>(
      `/t/${tenantSlug}/surveys/${surveyId}/questions`,
      { params }
    );
    return res.data;
  },

  create: async (
    tenantSlug: string,
    surveyId: string,
    data: { label: string; type: QuestionType; position: number }
  ) => {
    const res = await api.post(
      `/t/${tenantSlug}/surveys/${surveyId}/questions`,
      data
    );
    return res.data;
  },

  update: async (
    tenantSlug: string,
    surveyId: string,
    id: string,
    data: Partial<{ label: string; type: QuestionType; position: number }>
  ) => {
    const res = await api.put(
      `/t/${tenantSlug}/surveys/${surveyId}/questions/${id}`,
      data
    );
    return res.data;
  },

  remove: async (tenantSlug: string, surveyId: string, id: string) => {
    await api.delete(`/t/${tenantSlug}/surveys/${surveyId}/questions/${id}`);
  },
};

export default questionService;
// ===========================
// import api from "../utils/api";

// export const questionService = {
//   list: (slug: string, surveyId: string, params?: any) =>
//     api.get(`/t/${slug}/surveys/${surveyId}/questions`, { params }),

//   create: (slug: string, surveyId: string, data: any) =>
//     api.post(`/t/${slug}/surveys/${surveyId}/questions`, data),

//   update: (slug: string, surveyId: string, id: string, data: any) =>
//     api.put(`/t/${slug}/surveys/${surveyId}/questions/${id}`, data),

//   remove: (slug: string, surveyId: string, id: string) =>
//     api.delete(`/t/${slug}/surveys/${surveyId}/questions/${id}`),
// };
