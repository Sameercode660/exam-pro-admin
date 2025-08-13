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
    // Add Sr. numbers to exported data
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

  // New array of columns with "Sr." at the front
  const tableColumns = useMemo(() => ["Sr.", ...columns], [columns]);

  return (
    <div className="p-2">
      <div className="flex justify-between mb-2">
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
          Download Excel
        </button>
      </div>

      <div className="overflow-x-auto">
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
            {filteredData.length === 0 ? (
              <tr className="hover:bg-gray-100 border-b">
                <td colSpan={tableColumns.length} className="text-center p-4 text-gray-500">
                  No data found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-100 border-b">
                  {tableColumns.map((col, index) => (
                    <td
                      key={col}
                      className={`px-4 py-2 text-center border-0 ${
                        color && index === 1 ? `${color} cursor-pointer` : ""
                      }`}
                      onClick={index === 1 && event ? event : undefined}
                    >
                      {col === "Sr."
                        ? i + 1
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
      </div>
    </div>
  );
}
