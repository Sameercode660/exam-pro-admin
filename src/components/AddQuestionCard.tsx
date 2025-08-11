'use client';

import React, { useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
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
  fetchQuestions: (currentPage: number) => Promise<void>;
  page: number;
}

const AddQuestionCard: React.FC<QuestionCardProps> = ({ questions, fetchQuestions, page }) => {
  const { examId } = useParams();
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [key: number]: { text: string; type: string } }>({});

  function eraseError(questionId: number) {
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [questionId]: { text: '', type: '' }
      }));
    }, 3000);
  }

  const handleAddQuestion = async (questionId: number) => {
    if (!examId) {
      setMessages(prev => ({
        ...prev,
        [questionId]: { text: "Exam ID is missing.", type: "error" }
      }));
      eraseError(questionId);
      return;
    }

    setLoadingStates(prev => ({ ...prev, [questionId]: true }));

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/add-question-in-exam`, {
        examId: Number(examId),
        questionId,
      });

      setMessages(prev => ({
        ...prev,
        [questionId]: { text: response.data.message, type: response.data.status ? 'success' : 'error' }
      }));

      eraseError(questionId);
    } catch (err: any) {
      setMessages(prev => ({
        ...prev,
        [questionId]: { text: "An error occurred while adding the question.", type: 'error' }
      }));
      eraseError(questionId);
    } finally {
      setLoadingStates(prev => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {questions.map((question) => (
        <div
          key={question.id}
          className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex flex-wrap justify-between gap-6"
        >
          {/* Left section: Question content */}
          <div className="flex-1 min-w-[250px]">
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

            {/* Button & Message */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleAddQuestion(question.id)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 
          ${loadingStates[question.id]
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                disabled={loadingStates[question.id]}
              >
                {loadingStates[question.id] ? "Adding..." : "Add Question"}
              </button>

              {messages[question.id]?.text && (
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-md border 
            ${messages[question.id]?.type === 'error'
                      ? 'text-red-600 bg-red-50 border-red-200'
                      : 'text-green-600 bg-green-50 border-green-200'
                    }`}
                >
                  {messages[question.id]?.text}
                </span>
              )}
            </div>
          </div>

          {/* Right section: Question info */}
          <div className="flex flex-wrap gap-2 items-start">
            <li className="text-gray-400 list-none font-semibold bg-gray-100 px-2 py-1 rounded-md">
              &#8226; {question.category.name}
            </li>
            <li className="text-gray-400 list-none font-semibold bg-gray-100 px-2 py-1 rounded-md">
              &#8226; {question.topic.name}
            </li>
            <li className="text-gray-400 list-none font-semibold">
              <span
                className={`px-2 py-1 rounded 
          ${question.difficulty === "EASY"
                    ? "bg-green-100 text-green-800"
                    : question.difficulty === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
              >
                &#8226; {question.difficulty}
              </span>
            </li>
            <li className="text-gray-400 list-none font-semibold bg-gray-100 px-2 py-1 rounded-md">
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
