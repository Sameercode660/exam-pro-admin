'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QuestionCard from '@/components/QuestionCard';

function ManageQuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1); // Current page
  const limit = 10; // Number of questions per page

  const fetchQuestions = async (currentPage: number) => {
    setLoading(true);
    setError('');
    const adminId = Number(localStorage.getItem('adminId')) || 1; // Fallback to default adminId for testing

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/questions/fetch-all-question`,
        {
          adminId,
          page: currentPage,
          limit,
        }
      );
      setQuestions(response.data.response.questions || []);
    } catch (err) {
      setError('Failed to fetch questions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(page);
  }, [page]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Question Bank</h1>
      {loading && <p>Loading questions...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && questions.length > 0 && <QuestionCard questions={questions} fetchQuestions={fetchQuestions} page={page} />}
      {!loading && !error && questions.length === 0 && (
        <p>No questions available. Please add some questions to the question bank.</p>
      )}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          disabled={questions.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ManageQuestionBank;
