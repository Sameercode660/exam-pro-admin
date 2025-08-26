'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface QuestionCardProps {
  questions: any[];
  fetchQuestions: (page: number) => Promise<void>;
  page: number;
}

const AddQuestionCard: React.FC<QuestionCardProps> = ({ questions, fetchQuestions, page }) => {
  const { examId } = useParams();
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadyAdded, setAlreadyAdded] = useState<number[]>([]);

  // Fetch already inserted question IDs
  const fetchAlreadyAdded = async () => {
    if (!examId) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/exams/get-inserted-question`,
        { params: { examId: Number(examId) } }
      );
      setAlreadyAdded(res.data.questionIds || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlreadyAdded();
  }, [examId]);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(
        questions
          .filter(q => !alreadyAdded.includes(q.id))
          .map(q => q.id)
      );
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectQuestion = (questionId: number) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };

  const handleAddSelected = async () => {
    if (!examId || selectedQuestions.length === 0) {
      alert("Select at least one question.");
      return;
    }
    setLoading(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/add-question-in-exam`, {
        examId: Number(examId),
        questionIds: selectedQuestions,
      });

      // alert("Questions added successfully!");
      setSelectedQuestions([]);
      setSelectAll(false);
      fetchQuestions(page);
      fetchAlreadyAdded();
    } catch (err) {
      console.log(err);
      // alert("Error adding questions.");
      toast.error('Unable to add questions')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Select All & Bulk Add */}
      <div className="flex items-center gap-4 mb-4">
        <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
        <label>Select All</label>
        <button
          onClick={handleAddSelected}
          disabled={loading || selectedQuestions.length === 0}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300"
        >
          {loading ? "Adding..." : `Add Selected ${selectedQuestions.length == 0 ? '(0)' : '(' + selectedQuestions.length + ')'} `}
        </button>
      </div>

      {questions.map((question) => {
        const isAlreadyInExam = alreadyAdded.includes(question.id);
        return (
          <div
            key={question.id}
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex justify-between"
          >
            {/* Left: selection + content */}
            <div className="flex gap-4">
              <input
                type="checkbox"
                checked={selectedQuestions.includes(question.id)}
                onChange={() => toggleSelectQuestion(question.id)}
                disabled={isAlreadyInExam}
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{question.text}</h2>
                <h3 className="font-semibold text-gray-800">Options:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {question.options.map((opt: any) => (
                    <li
                      key={opt.id}
                      className={opt.isCorrect ? "text-green-600 font-semibold" : ""}
                    >
                      {opt.text}
                    </li>
                  ))}
                </ul>
                {isAlreadyInExam && (
                  <p className="text-red-500 text-sm mt-2">Already in this exam</p>
                )}
              </div>
            </div>

            {/* Right: metadata */}
            <div className="flex space-x-4 items-start">
              <li className="text-gray-400 list-none font-semibold bg-gray-100 h-7 px-2 flex justify-center items-center rounded-md">
                &#8226; {question.category?.name}
              </li>
              <li className="text-gray-400 list-none font-semibold bg-gray-100 h-7 px-2 flex justify-center items-center rounded-md">
                &#8226; {question.topic?.name}
              </li>
              <li className="text-gray-400 list-none font-semibold h-7 px-2 flex justify-center items-center rounded-md">
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
              <li className="text-gray-400 list-none font-semibold bg-gray-100 h-7 px-2 flex justify-center items-center rounded-md">
                &#8226; {new Date(question.createdAt).toLocaleDateString()}
              </li>
            </div>
          </div>
        );
      })}
      <ToastContainer position="top-center" autoClose={1000}></ToastContainer>
    </div>
  );
};

export default AddQuestionCard;
