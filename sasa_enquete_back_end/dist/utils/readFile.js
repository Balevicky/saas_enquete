// import { parse } from "csv-parse/sync";
// import * as XLSX from "xlsx";
import csv from "csv-parse/sync";
import XLSX from "xlsx";
export function parseFile(buffer, mimetype) {
    if (mimetype.includes("csv")) {
        return csv.parse(buffer.toString(), {
            columns: true,
            skipEmptyLines: true,
            trim: true,
        });
    }
    if (mimetype.includes("spreadsheetml") ||
        mimetype.includes("excel") ||
        mimetype.includes("xlsx")) {
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json(sheet);
    }
    throw new Error("Unsupported file type");
}
