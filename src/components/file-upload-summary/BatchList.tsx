"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { downloadUploadSummaryExcel } from "@/lib/summary-download";
import { useAuth } from "@/context/AuthContext";

export default function BatchList() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const organizationId = user?.organizationId;

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_ROOT_URL}/file-upload-summary`,
          {
            organizationId,
            type: "QUESTION_FILE",
          }
        );
        setBatches(res.data.batches || []);
      } catch (err) {
        console.error("Error loading batches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [organizationId]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-3xl mx-auto">
      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        📦 Uploaded Question Batches
      </h1>

      {loading && (
        <p className="text-gray-500 italic">Loading batches...</p>
      )}

      {!loading && batches.length === 0 && (
        <p className="text-gray-500 italic">No batches found.</p>
      )}

      <div className="space-y-3">
        {batches.map((batch) => (
          <div
            key={batch.batchId}
            className="flex items-center justify-between border border-gray-200 p-4 rounded-lg hover:shadow-sm transition-shadow bg-gray-50"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-gray-700">{batch.label}</span>
              <span className="text-xs text-gray-500">
                Batch ID: {batch.batchId}
              </span>
            </div>
            <button
              onClick={() =>
                downloadUploadSummaryExcel(
                  batch.summaryData,
                  `Batch_${batch.batchId}_Summary`
                )
              }
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors"
            >
              ⬇ Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
