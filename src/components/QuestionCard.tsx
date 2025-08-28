'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface QuestionOption {
  id: number;
  text: string;
  questionId: number;
  isCorrect: boolean;
}

interface QuestionCategory {
  id: number;
  name: string;
}

interface QuestionTopic {
  id: number;
  name: string;
  categoryId: number;
}

interface QuestionResponse {
  id: number;
  text: string;
  categoryId: number;
  topicId: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  correctOption: number;
  createdAt: string;
  updatedAt: string;
  adminId: number;
  examId: number | null;
  updatedBy: number | null;
  category: QuestionCategory;
  topic: QuestionTopic;
  options: QuestionOption[];
}

interface QuestionCardProps {
  questions: QuestionResponse[];
  fetchQuestions: (currentPage: number) => Promise<void>;
  page: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ questions, fetchQuestions, page }) => {
  const router = useRouter();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const adminId = user?.id;

  const handleDelete = async (id: number | null) => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_ROOT_URL}/questions/delete-question`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: id, adminId })
      });

      const result = await res.json();
      if (result.status) {
        fetchQuestions(page);
      } else {
        alert(result.message || "Failed to delete");
      }
    } catch (error) {
      alert("Something went wrong while deleting");
    } finally {
      setLoading(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {questions.map((question) => (
        <div
          key={question.id}
          className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full"
        >
          {/* Header: Question and Metadata */}
          <div className="flex justify-between items-center gap-4 mb-4 w-full overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-800 truncate max-w-[60%] whitespace-nowrap">
              {question.text}
            </h2>

            <div className="flex items-center gap-2 flex-shrink-0 min-w-0 overflow-hidden">
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full truncate whitespace-nowrap max-w-[130px]">
                {question.category.name}
              </span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full truncate whitespace-nowrap max-w-[130px]">
                {question.topic.name}
              </span>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full truncate whitespace-nowrap ${question.difficulty === "EASY"
                    ? "bg-green-100 text-green-700"
                    : question.difficulty === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
              >
                <span>{question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1).toLowerCase()}</span>

              </span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full truncate whitespace-nowrap max-w-[100px]">
                {new Date(question.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Options:</h3>
            <ul className="space-y-1">
              {question.options.map((option) => (
                <li
                  key={option.id}
                  className={`px-3 py-2 rounded-lg text-sm ${option.isCorrect
                      ? "bg-green-50 text-green-800 font-medium border border-green-200"
                      : "text-gray-700"
                    }`}
                >
                  {option.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 mt-4">
            <button
              onClick={() => router.push(`/home/questions/update-question/${question.id}`)}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleteTargetId(question.id)}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-md mx-auto p-6 rounded-2xl shadow-2xl border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete Question</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  onClick={() => setDeleteTargetId(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                  onClick={() => handleDelete(deleteTargetId)}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionCard;
