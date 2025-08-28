"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import DynamicTable from "../utils/DynamicTable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageHeading from "../utils/PageHeading";

type RemovedQuestion = {
  id: number;
  title: string;
  batchId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  removedBy: string | null;
};

type BatchOption = {
  label: string;
  batchId: number;
};

export default function RemovedQuestions() {
  const [questions, setQuestions] = useState<RemovedQuestion[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

  const { user } = useAuth();

  const fetchQuestions = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-questions/fetch-removed-questions`,
        { organizationId: user?.organizationId, batchId: Number(selectedBatch) }
      );
      console.log(res.data.data)
      setQuestions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch removed questions:", err);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/batch-ids`,
        { organizationId: user?.organizationId, type: "questions" }
      );
      setBatches(res.data);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  useEffect(() => {
    if (user?.organizationId || selectedBatch) {
      fetchQuestions();
    }
  }, [user?.organizationId, selectedBatch]);


  useEffect(() => {
    fetchBatches();
  }, [])
  const handleRestore = async (questionId: number) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-questions/restore-question`,
        { questionId, adminId: user?.id }
      );
      fetchQuestions();
    } catch (err) {
      toast.error("Unable to restore the question, try again later");
      console.error("Restore failed:", err);
    }
  };

  const columns = [
    "BatchId",
    "Title",
    "Created By",
    "Removed By",
    "Created At",
    "Removed At",
    "Action",
  ];

  const formattedData = questions.map((q) => ({  "BatchId": q.batchId,"Title": q.title,  "Created By": q.createdBy, "Removed By": q.removedBy || "-", "Created At": new Date(q.createdAt).toLocaleString(), "Removed At": new Date(q.updatedAt).toLocaleString(), "Action": q.id, }));

  return (
    <>
    <PageHeading title="Removed Questions"></PageHeading>
      <div className="p-4">
      {/* <h1 className="text-xl font-semibold mb-4">Removed Questions</h1> */}

      {/* Dropdown for batches */}
      <div className="mb-4">
        <select
          className="border px-3 py-2 rounded w-full md:w-1/3"
          value={selectedBatch ?? ""}
          onChange={(e) => {
            setSelectedBatch(e.target.value ? Number(e.target.value) : null)
          }}
        >
          <option value="">All Batches</option>
          {batches.map((batch) => (
            <option key={batch.batchId} value={batch.batchId}>
              {batch.label}
            </option>
          ))}
        </select>
      </div>

      <DynamicTable
        columns={columns}
        data={formattedData}
        searchable={true}
        renderCell={(row, col) => {
          if (col === "Action") {
            return (
              <button
                onClick={() => handleRestore(row[col])}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Restore
              </button>
            );
          }
          return row[col];
        }}
      />
      <ToastContainer position="top-center"></ToastContainer>
    </div>
    </>
  );
}
