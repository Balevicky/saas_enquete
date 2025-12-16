import api from "../utils/api";

export interface Survey {
  id: string;
  title: string;
  status?: string;
  createdAt: string;
  _count?: {
    respondents: number;
    responses: number;
  };
}

export interface SurveyListResponse {
  data: Survey[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    filters: any;
  };
}

const surveyService = {
  list: async (tenantSlug: string, params?: any) => {
    const res = await api.get<SurveyListResponse>(`/t/${tenantSlug}/surveys`, {
      params,
    });
    return res.data;
  },

  get: async (tenantSlug: string, id: string) => {
    const res = await api.get<Survey>(`/t/${tenantSlug}/surveys/${id}`);
    return res.data;
  },

  create: async (tenantSlug: string, data: { title: string; json?: any }) => {
    const res = await api.post(`/t/${tenantSlug}/surveys`, data);
    return res.data;
  },

  update: async (
    tenantSlug: string,
    id: string,
    data: { title: string; json?: any }
  ) => {
    const res = await api.put(`/t/${tenantSlug}/surveys/${id}`, data);
    return res.data;
  },

  publish: async (tenantSlug: string, id: string) => {
    const res = await api.post(`/t/${tenantSlug}/surveys/${id}/publish`);
    return res.data;
  },
};

export default surveyService;
// ==============================
// import api from "../utils/api";

// export const surveyService = {
//   list: (slug: string, params?: any) =>
//     api.get(`/t/${slug}/surveys`, { params }),

//   get: (slug: string, id: string) => api.get(`/t/${slug}/surveys/${id}`),

//   create: (slug: string, data: any) => api.post(`/t/${slug}/surveys`, data),

//   update: (slug: string, id: string, data: any) =>
//     api.put(`/t/${slug}/surveys/${id}`, data),

//   publish: (slug: string, id: string) =>
//     api.post(`/t/${slug}/surveys/${id}/publish`),
// };
