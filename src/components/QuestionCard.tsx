'use client';

import React, { useState } from "react";
import axios from "axios";

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
  fetchQuestions: (currentPage: number) => Promise<void>;
  page: number
}

const QuestionCard: React.FC<QuestionCardProps> = ({ questions, fetchQuestions, page }) => {
  const [loading, setLoading] = useState(false);

  // Function to delete the question
  const handleDelete = async (id: number, adminId: number) => {
    try {
      const data = { questionId: id, adminId };
      console.log(data);

      setLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/questions/delete-question`,
        { data }
      );
      setLoading(false);

      if (response.data.status) {
        console.log("Question deleted successfully:", response.data.message);
        fetchQuestions(page); // Refetch questions after deletion
      } else {
        console.error("Failed to delete question:", response.data.message);
        alert(response.data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in deleting:", error.message);
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    console.log("Edit question with ID:", id);
    // Add edit logic here
  };

  return (
    <div className="p-6 space-y-6">
      {questions.map((question) => (
        <div
          key={question.id}
          className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-2">{question.text}</h2>
          <p className="text-gray-600">
            <span className="font-semibold">Created By:</span> {question.createdByName}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Category:</span> {question.category.name}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Topic:</span> {question.topic.name}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Difficulty:</span>{" "}
            <span
              className={`px-2 py-1 rounded ${
                question.difficulty === "EASY"
                  ? "bg-green-100 text-green-800"
                  : question.difficulty === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {question.difficulty}
            </span>
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Created At:</span>{" "}
            {new Date(question.createdAt).toLocaleDateString()}
          </p>
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800">Options:</h3>
            <ul className="list-disc list-inside text-gray-600">
              {question.options.map((option) => (
                <li
                  key={option.id}
                  className={`${
                    option.isCorrect ? "text-green-600 font-semibold" : ""
                  }`}
                >
                  {option.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => handleEdit(question.id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() =>
                handleDelete(question.id, Number(localStorage.getItem("adminId")))
              }
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionCard;
