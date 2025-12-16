import api from "../utils/api";

export const responseService = {
  save: (slug: string, respondentId: string, questionId: string, answer: any) =>
    api.post(`/t/${slug}/respondents/${respondentId}/responses`, {
      questionId,
      answer,
    }),
};
