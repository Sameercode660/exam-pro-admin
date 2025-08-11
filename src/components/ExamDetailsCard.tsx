'use client';

import React, { useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  createdByName: string;
}

interface QuestionCardProps {
  questions: QuestionResponse[];
  fetchExamQuestions: () => Promise<void>;
  page: number;
}

const ExamDetailsCard: React.FC<QuestionCardProps> = ({ questions, fetchExamQuestions }) => {
  const { examId } = useParams();
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelectQuestion = (questionId: number) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map((q) => q.id));
    }
  };

  const handleBulkRemoveQuestions = async () => {
    if (!examId) {
      setError("Exam ID is missing.");
      return;
    }

    if (selectedQuestions.length === 0) {
      toast.warning("Please select at least one question to remove.");
      return;
    }

    setBulkLoading(true);
    setError(null);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/remove-question-from-exam`, {
        examId: Number(examId),
        questionIds: selectedQuestions,
      });

      toast.success("Selected questions removed successfully.");
      setSelectedQuestions([]);
      await fetchExamQuestions();
    } catch (err: any) {
      toast.error("An error occurred while removing questions.");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Actions Row */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <input
            type="checkbox"
            onChange={toggleSelectAll}
            checked={selectedQuestions.length === questions.length && questions.length > 0}
            className="mr-2"
          />
          <label className="text-gray-700">Select All</label>
        </div>

        {selectedQuestions.length > 0 && (
          <button
            onClick={handleBulkRemoveQuestions}
            className={`px-4 py-2 rounded-lg ${
              bulkLoading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            disabled={bulkLoading}
          >
            {bulkLoading
              ? "Removing..."
              : `Remove Selected (${selectedQuestions.length})`}
          </button>
        )}
      </div>

      {questions.map((question) => (
        <div
          key={question.id}
          className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex justify-between items-start"
        >
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={selectedQuestions.includes(question.id)}
            onChange={() => toggleSelectQuestion(question.id)}
            className="mt-2 mr-4"
          />

          {/* Question content */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{question.text}</h2>
            <h3 className="font-semibold text-gray-800">Options:</h3>
            <ul className="list-disc list-inside text-gray-600">
              {question.options.map((option) => (
                <li
                  key={option.id}
                  className={`${option.isCorrect ? "text-green-600 font-semibold" : ""}`}
                >
                  {option.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Question info */}
          <div className="flex space-x-6 ml-4">
            <li className="text-gray-400 list-none font-semibold bg-gray-100 h-7 p-1 flex justify-center items-center rounded-md">
              &#8226; {question.category.name}
            </li>
            <li className="text-gray-400 list-none font-semibold bg-gray-100 h-7 p-1 flex justify-center items-center rounded-md">
              &#8226; {question.topic.name}
            </li>
            <li className="text-gray-400 list-none font-semibold h-7 p-1 flex justify-center items-center rounded-md">
              <span
                className={`px-2 py-1 rounded ${
                  question.difficulty === "EASY"
                    ? "bg-green-100 text-green-800"
                    : question.difficulty === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                &#8226; {question.difficulty}
              </span>
            </li>
            <li className="text-gray-400 list-none font-semibold bg-gray-100 h-7 p-1 flex justify-center items-center rounded-md">
              &#8226; {new Date(question.createdAt).toLocaleDateString()}
            </li>
          </div>
        </div>
      ))}

      {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
    </div>
  );
};

export default ExamDetailsCard;
