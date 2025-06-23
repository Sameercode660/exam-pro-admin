'use client';

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const router = useRouter();

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
      setOpenDeletePopup(false)

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
      setOpenDeletePopup(false)
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
          className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex justify-between"
        >

          {/* actual question */}
          <div className="mt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{question.text}</h2>
            <h3 className="font-semibold text-gray-800">Options:</h3>
            <ul className="list-disc list-inside text-gray-600">
              {question.options.map((option) => (
                <li
                  key={option.id}
                  className={`${option.isCorrect ? "text-green-600 font-semibold" : ""
                    }`}
                >
                  {option.text}
                </li>
              ))}
            </ul>
                 <div className="mt-4 flex space-x-4">
            <button
              onClick={() => {
                router.push(`/home/questions/update-question/${question.id}`)
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
            >
              Edit
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={() => {
                setOpenDeletePopup(true)
              }}
            >
              Delete
            </button>
          </div>
          </div>

          {/* question info  */}
          <div className="flex space-x-6">
            {/* <p className="text-gray-600">
              <span className="font-semibold">Created By:</span> {question.createdByName}
            </p> */}
            <li className="text-gray-400 list-none font-semibold bg-gray-100 h-7 p-1 flex justify-center items-center rounded-md">
               &#8226;{" "}{question.category.name}
            </li>
            <li className="text-gray-400 list-none font-semibold bg-gray-100 h-7 p-1 flex justify-center items-center rounded-md">
               &#8226;{" "}{question.topic.name}
            </li>
            <li className="text-gray-400 list-none font-semibold h-7 p-1 flex justify-center items-center rounded-md">
              <span
                className={`px-2 py-1 rounded ${question.difficulty === "EASY"
                  ? "bg-green-100 text-green-800"
                  : question.difficulty === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                  }`}
              >
                &#8226;{" "}{question.difficulty}
              </span>
            </li>
            <li className="text-gray-400 list-none font-semibold bg-gray-100 h-7 p-1 flex justify-center items-center rounded-md">
              &#8226;{" "}{new Date(question.createdAt).toLocaleDateString()}
            </li>
          </div>

          {/* edit  */}
     

          {/* delete option Popup  */}
          {
            openDeletePopup ? (<div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
                <p className="text-gray-600 mb-6">Do you really want to delete this item.</p>
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                    onClick={() => {
                      setOpenDeletePopup(false)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                    onClick={() =>
                      handleDelete(question.id, Number(localStorage.getItem("adminId")))
                    }
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>) : (<></>)
          }

        </div>
      ))}



    </div>
  );
};

export default QuestionCard;
