"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import DynamicTable from "../utils/DynamicTable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


type RemovedExam = {
  id: number;
  name: string;
  description: string;
  duration: string;
  createdAt: string;
  removedAt: string;
  createdBy: string;
  removedBy: string | null;
};

export default function RemovedExams() {
  const [exams, setExams] = useState<RemovedExam[]>([]);
  const { user } = useAuth();

  const fetchRemovedExams = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-exams/fetch-removed-exams`,
        { organizationId: user?.id }
      );
      setExams(res.data.data);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    }
  };

  useEffect(() => {
    fetchRemovedExams();
  }, []);

  const handleRestore = async (examId: number) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-exams/restore-exam`,
        { examId, userId: user?.id }
      );
      fetchRemovedExams(); 
    } catch (err) {
      toast.error("Unable to restore, try again later")
      console.error("Restore failed:", err);
    }
  };

  const columns = [
    "Title",
    "Description",
    "Duration",
    "Created At",
    "Removed At",
    "Created By",
    "Removed By",
    "Action",
  ];

  const formattedData = exams.map((exam) => ({
    "Title": exam.name,
    "Description": exam.description,
    "Durations": exam.duration,
    "Created At": new Date(exam.createdAt).toLocaleString(),
    "Removed At": new Date(exam.removedAt).toLocaleString(),
    "Created By": exam.createdBy,
    "Removed By": exam.removedBy || "-",
    "Action": exam.id,
  }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Removed Exams</h1>

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
