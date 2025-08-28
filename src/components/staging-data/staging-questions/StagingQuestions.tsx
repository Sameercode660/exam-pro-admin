'use client';

import { useEffect, useState } from "react";
import DynamicTable from "@/components/utils/DynamicTable";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import PageHeading from "@/components/utils/PageHeading";

const STAGING_STATUSES = ["PENDING", "VALID", "INVALID", "DUPLICATE", "IMPORTED"];

interface UploadTimestamp {
  raw: string;
  formatted: string;
  batchId: number
}

export default function StagingQuestions() {
  const [uploadTimestamps, setUploadTimestamps] = useState<UploadTimestamp[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const { user } = useAuth();
  const organizationId = user?.organizationId;
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>('')
  const [selectedValue, setSelectedValue] = useState("");


  const fetchTimestamps = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/staging-data/staging-question/upload-timestamp`, {
        organizationId,
      });

      const data = res.data?.uploadTimestamps;
      console.log(res.data.uploadTimestamps)
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
        batchId: Number(selectedBatchId) || undefined,
      });

      console.log(res.data.data)
      const responseData = res.data?.data;

      if (!Array.isArray(responseData)) {
        console.error("Unexpected response format. 'data' is not an array:", responseData);
        setTableData([]);
        return;
      }

      const mapped = responseData.map((item: any) => ({
        ID: item.id,
        BatchId: item.batchId,
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
        ErrorMessage: item.errorMessage,
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
   <>
    <PageHeading title="Staging Questions"></PageHeading>
     <div className="pr-4 pl-4 pb-4 space-y-4">
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
          value={selectedValue}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedValue(value);

            if (value) {
              const { batchId, raw } = JSON.parse(value);
              setSelectedBatchId(batchId);
              setSelectedTimestamp(raw);
            } else {
              // reset if "Filter by BatchId" is chosen
              setSelectedBatchId(null);
              setSelectedTimestamp(null);
            }
          }}
          className="p-2 border rounded"
        >
          <option value="">Filter by BatchId</option>
          {uploadTimestamps.map((ts, idx) => (
            <option
              key={idx}
              value={JSON.stringify({ batchId: ts.batchId, raw: ts.raw })}
            >
              {`batchId-${ts.batchId} - ${ts.formatted}`}
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
          "BatchId",
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
          "ErrorMessage",
          "Admin",
          "CreatedAt",
        ]}
        data={tableData}
        searchable
      />
    </div>
   </>
  );
}
