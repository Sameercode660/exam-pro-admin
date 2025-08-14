import * as XLSX from "xlsx";

export function downloadUploadSummaryExcel(summaryData: {
  columns: string[];
  rows: any[][];
  totals: { inserted: number; skipped: number; failed: number; total: number };
  meta: { fileName: string; processedAt: string; batchId: number; batchStatus: string };
}, NameOfFile: string) {
  // 1) Prepare main sheet rows (columns + data)
  const sheetRows = [summaryData.columns, ...summaryData.rows];

  // 2) Add an empty row, then totals
  sheetRows.push([]);
  sheetRows.push(["Totals", "", "", ""]);
  sheetRows.push(["Inserted", summaryData.totals.inserted]);
  sheetRows.push(["Skipped", summaryData.totals.skipped]);
  sheetRows.push(["Failed", summaryData.totals.failed]);
  sheetRows.push(["Total", summaryData.totals.total]);

  // 3) Add meta info at the bottom
  sheetRows.push([]);
  sheetRows.push(["Meta Info"]);
  Object.entries(summaryData.meta).forEach(([key, value]) => {
    sheetRows.push([key, String(value)]);
  });

  // 4) Create worksheet & workbook
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Upload Summary");

  // 5) Trigger file download
  const downloadFileName = `BatchId_${summaryData.meta.batchId}_Upload_Summary_${NameOfFile}.xlsx`;
  XLSX.writeFile(workbook, downloadFileName);
}
