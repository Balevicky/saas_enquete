// src/utils/respondentStatus.ts
import { Respondent } from "../services/respondentService";

export type RespondentStatus = "pending" | "completed";

export const getRespondentStatus = (
  respondent: Respondent
): RespondentStatus => {
  return respondent.completedAt ? "completed" : "pending";
};
