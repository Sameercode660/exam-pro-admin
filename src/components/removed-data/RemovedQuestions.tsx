"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import DynamicTable from "../utils/DynamicTable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type RemovedQuestion = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  removedBy: string | null;
};

export default function RemovedQuestions() {
  const [questions, setQuestions] = useState<RemovedQuestion[]>([]);
  const { user } = useAuth();

  const fetchQuestions = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-questions/fetch-removed-questions`,
        { organizationId: user?.organizationId }
      );
      setQuestions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch removed questions:", err);
    }
  };

  useEffect(() => {
    if (user?.organizationId) {
      fetchQuestions();
    }
  }, [user?.organizationId]);

  const handleRestore = async (questionId: number) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-questions/restore-question`,
        { questionId, adminId: user?.id }
      );
      fetchQuestions();
    } catch (err) {
      toast.error('Unable to restore the question, try again later');
      console.error("Restore failed:", err);
    }
  };

  const columns = [
    "Title",
    "Created By",
    "Removed By",
    "Created At",
    "Removed At",
    "Action",
  ];

  const formattedData = questions.map((q) => ({
    "Title": q.title,
    "Created By": q.createdBy,
    "Removed By": q.removedBy || "-",
    "Created At": new Date(q.createdAt).toLocaleString(),
    "Removed At": new Date(q.updatedAt).toLocaleString(),
    "Action": q.id,
  }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Removed Questions</h1>

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
  );
}
