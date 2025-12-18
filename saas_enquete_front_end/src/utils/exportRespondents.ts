import * as XLSX from "xlsx";
import { Respondent } from "../services/respondentService";

export const exportRespondentsToExcel = (
  respondents: Respondent[],
  fileName = "respondents.xlsx"
) => {
  const data = respondents.map((r) => ({
    ID: r.id,
    Name: r.name,
    Firstname: r.firstname,
    "Birth Year": r.birthYear,
    "Village ID": r.villageId,
    "External ID": r.externalId,
    "Started At": r.startedAt,
    "Completed At": r.completedAt,
    Status: r.completedAt ? "completed" : "pending",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Respondents");

  XLSX.writeFile(workbook, fileName);
};

// =====================================
// import { utils, writeFile } from "xlsx";
// import { Respondent } from "../services/respondentService";

// export const exportRespondentsToCSV = (
//   respondents: Respondent[],
//   filename = "respondents.csv"
// ) => {
//   const worksheet = utils.json_to_sheet(respondents);
//   const csv = utils.sheet_to_csv(worksheet);

//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const link = document.createElement("a");

//   link.href = URL.createObjectURL(blob);
//   link.download = filename;
//   link.click();
// };

// export const exportRespondentsToExcel = (
//   respondents: Respondent[],
//   filename = "respondents.xlsx"
// ) => {
//   const worksheet = utils.json_to_sheet(respondents);
//   const workbook = utils.book_new();

//   utils.book_append_sheet(workbook, worksheet, "Respondents");
//   writeFile(workbook, filename);
// };
