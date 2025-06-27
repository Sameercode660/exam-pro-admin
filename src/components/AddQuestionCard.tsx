'use client';

import React, { useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

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
  page: number;
}

const AddQuestionCard: React.FC<QuestionCardProps> = ({ questions, fetchQuestions, page }) => {
  const { examId } = useParams();
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const handleAddQuestion = async (questionId: number) => {
    if (!examId) {
      setError("Exam ID is missing.");
      return;
    }

    // Set the loading state for the specific question
    setLoadingStates((prev) => ({ ...prev, [questionId]: true }));
    setError(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/add-question-in-exam`, {
        examId: Number(examId),
        questionId,
      });

      if(response.data.status == false) {
        alert(response.data.message);
      } else {
        alert(response.data.message);
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("This question is already added to the exam.");
      } else {
        setError("An error occurred while adding the question.");
      }
    } finally {
      // Reset the loading state for the specific question
      setLoadingStates((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {questions.map((question) => (
        <div
          key={question.id}
          className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex justify-between"
        >
          {/* Question content */}
          <div className="mt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{question.text}</h2>
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
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleAddQuestion(question.id)}
                className={`px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer ${
                  loadingStates[question.id]
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 text-white"
                }`}
                disabled={loadingStates[question.id]}
              >
                {loadingStates[question.id] ? "Adding..." : "Add Question"}
              </button>
            </div>
          </div>

          {/* Question info */}
          <div className="flex space-x-6">
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

      {error && (
        <div className="text-red-500 mt-4 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default AddQuestionCard;
