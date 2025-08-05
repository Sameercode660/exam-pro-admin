'use client';

import { useEffect, useState } from "react";
import DynamicTable from "@/components/utils/DynamicTable";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const STAGING_STATUSES = ["PENDING", "VALID", "INVALID", "DUPLICATE", "IMPORTED"];

interface UploadTimestamp {
  raw: string;
  formatted: string;
}

export default function StagingQuestions() {
  const [uploadTimestamps, setUploadTimestamps] = useState<UploadTimestamp[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const { user } = useAuth();
  const organizationId = user?.organizationId;

  const fetchTimestamps = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/staging-data/staging-question/upload-timestamp`, {
        organizationId,
      });

      const data = res.data?.uploadTimestamps;
      if (Array.isArray(data)) {
        setUploadTimestamps(data);
      } else {
        console.error("Unexpected timestamp response:", data);
      }
    } catch (err) {
      console.error("Error fetching timestamps:", err);
    }
  };

  const fetchFilteredData = async () => {
    if (!organizationId) return;

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/staging-data/staging-question/fetch-questions`, {
        organizationId,
        status: selectedStatus || undefined,
        uploadTimestamp: selectedTimestamp || undefined,
      });

      const responseData = res.data?.data;

      if (!Array.isArray(responseData)) {
        console.error("Unexpected response format. 'data' is not an array:", responseData);
        setTableData([]);
        return;
      }

      const mapped = responseData.map((item: any) => ({
        ID: item.id,
        Category: item.categoryName,
        Topic: item.topicName,
        Question: item.question,
        Option1: item.option1,
        Option2: item.option2,
        Option3: item.option3,
        Option4: item.option4,
        Correct: item.correctOption,
        Difficulty: item.difficultyLevel,
        Status: item.status,
        Admin: item.admin?.name,
        CreatedAt: new Date(item.createdAt).toLocaleString("en-IN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      }));

      setTableData(mapped);
    } catch (err) {
      console.error("Error fetching filtered data:", err);
      setTableData([]);
    }
  };

  // Initial timestamp fetch
  useEffect(() => {
    if (organizationId) {
      fetchTimestamps();
    }
  }, [organizationId]);

  // Refetch table data when filters change
  useEffect(() => {
    if (organizationId) {
      fetchFilteredData();
    }
  }, [selectedStatus, selectedTimestamp]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Filter by Status</option>
          {STAGING_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={selectedTimestamp}
          onChange={(e) => setSelectedTimestamp(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Filter by Upload Timestamp</option>
          {uploadTimestamps.map((ts, idx) => (
            <option key={idx} value={ts.raw}>
              {ts.formatted}
            </option>
          ))}
        </select>

        <button
          onClick={fetchFilteredData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply Filter
        </button>
      </div>

      <DynamicTable
        columns={[
          "ID",
          "Category",
          "Topic",
          "Question",
          "Option1",
          "Option2",
          "Option3",
          "Option4",
          "Correct",
          "Difficulty",
          "Status",
          "Admin",
          "CreatedAt",
        ]}
        data={tableData}
        searchable
      />
    </div>
  );
}
