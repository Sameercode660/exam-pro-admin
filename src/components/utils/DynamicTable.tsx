import { useState, useMemo, ReactNode } from "react";

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
  event
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

  return (
    <div className="p-2">
      {searchable && (
        <input
          type="text"
          placeholder="Search..."
          className="mb-4 p-2 border rounded w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-[#f1e9d9] text-gray-800 font-semibold">
            <tr>
              {columns.map((col) => (
                <th key={col} className={`px-4 py-3 text-center `}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredData.length === 0 ? (
              <tr className="hover:bg-gray-100 border-b">
                <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                  No data found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-100 border-b text">
                  {columns.map((col, index) => (
                    <td key={col} className={`px-4 py-2 text-center border-0 ${(color && index == 0) == true ? `${color} cursor-pointer` : ''}`} onClick={event != null ? event : () => { }}>
                      {renderCell ? renderCell(row, col) : row[col] ?? "-"}
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
