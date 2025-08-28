import { useState, useMemo, ReactNode } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type DynamicTableProps = {
  columns: string[];
  data: Record<string, any>[];
  renderCell?: (row: Record<string, any>, column: string) => ReactNode;
  searchable?: boolean;
  color?: string;
  event?: () => void;
};

export default function DynamicTable({
  columns,
  data,
  renderCell,
  searchable = false,
  color,
  event,
}: DynamicTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;
    return data.filter((row) =>
      columns.some((col) =>
        String(row[col] ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, data, columns, searchable]);

  const handleDownload = () => {
    const exportData = filteredData.map((row, idx) => ({
      Sr: idx + 1,
      ...row,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "List");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "List.xlsx");
  };

  const tableColumns = useMemo(() => ["Sr.", ...columns], [columns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1); // reset to first page when rows per page changes
  };

  return (
    <div className="p-2">
      <div className="flex justify-end mb-2">
        {searchable && (
          <input
            type="text"
            placeholder="Search..."
            className="p-2 border rounded w-full max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
        <button
          onClick={handleDownload}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export to Excel
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-[#f1e9d9] text-gray-800 font-semibold">
            <tr>
              {tableColumns.map((col) => (
                <th key={col} className="px-4 py-3 text-center">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {displayedData.length === 0 ? (
              <tr className="hover:bg-gray-100 border-b">
                <td colSpan={tableColumns.length} className="text-center p-4 text-gray-500">
                  No data found.
                </td>
              </tr>
            ) : (
              displayedData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-100 border-b">
                  {tableColumns.map((col, index) => (
                    <td
                      key={col}
                      className={`px-4 py-2 text-center border-0 ${color && index === 1 ? `${color} cursor-pointer` : ""
                        }`}
                      onClick={index === 1 && event ? event : undefined}
                    >
                      {col === "Sr."
                        ? startIndex + i + 1 // serial no. across pages
                        : renderCell
                          ? renderCell(row, col)
                          : row[col] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer with Pagination */}
        <div className="flex justify-between items-center mt-4">
          {/* Rows per page dropdown */}
          <div>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-300 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {[10, 50, 100, 200, 300, 400, 500].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Arrow pagination */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 hover:bg-gray-100 shadow-sm"
                }`}
            >
              {/* Left arrow icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <span className="text-sm font-medium text-gray-600">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 hover:bg-gray-100 shadow-sm"
                }`}
            >
              {/* Right arrow icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
