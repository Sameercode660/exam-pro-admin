'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import AddQuestionCard from './AddQuestionCard';
import { useAuth } from '@/context/AuthContext';

const AddQuestionInExam = () => {
  const { user } = useAuth();
  const adminId = user?.id;
  const organizationId = user?.organizationId;

  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [limit, setLimit] = useState(10);

  /** ---------- Fetch Functions ---------- **/
  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_URL}/filtering/fetch-question-batches`, {
        params: { organizationId }
      });
      setBatches(res.data.response || []);
    } catch (err) {
      setError('Failed to fetch batches');
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/filtering/fetch-category`, { adminId });
      setCategories(res.data || []);
    } catch (err) {
      setError('Failed to fetch categories.');
      console.error(err);
    }
  };

  const fetchTopics = async (categoryId: number) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/filtering/fetch-topics`, { categoryId, adminId });
      setTopics(res.data || []);
    } catch (err) {
      setError('Failed to fetch topics.');
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_URL}/filtering/filters-questions`, {
        params: {
          adminId,
          categoryId: selectedCategory || undefined,
          topicId: selectedTopic || undefined,
          difficulty: difficulty || undefined,
          page,
          limit,
        },
      });
      setQuestions(res.data.response || []);
      setTotalQuestions(res.data.total || 0);
    } catch (err) {
      setError('Failed to fetch questions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /** ---------- Effects ---------- **/
  useEffect(() => {
    fetchCategories();
    fetchBatches();
    fetchQuestions();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [limit])

  useEffect(() => {
    if (selectedCategory !== null) {
      fetchTopics(selectedCategory);
    } else {
      setTopics([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, selectedTopic, difficulty, page]);

  /** ---------- Local Search Filter ---------- **/
  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return questions;
    return questions.filter(q =>
      q.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [questions, searchTerm]);

  /** ---------- Render ---------- **/
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Add Question</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Search */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by question title..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <button
          onClick={() => setSearchTerm('')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedCategory || ''}
          onChange={e => setSelectedCategory(Number(e.target.value) || null)}
          className="p-2 border rounded max-w-[180px] truncate"
        >
          <option value="">Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id} className="truncate" title={cat.name}>{cat.name}</option>
          ))}
        </select>

        <select
          value={selectedTopic || ''}
          onChange={e => setSelectedTopic(Number(e.target.value) || null)}
          className="p-2 border rounded max-w-[180px] truncate"
          disabled={!topics.length}
        >
          <option value="">Topic</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id} className="truncate" title={topic.name}>{topic.name}</option>
          ))}
        </select>

        <select
          value={difficulty || ''}
          onChange={e => setDifficulty(e.target.value || null)}
          className="p-2 border rounded"
        >
          <option value="">Difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select
          value={selectedBatchId || ''}
          onChange={e => setSelectedBatchId(Number(e.target.value) || null)}
          className="p-2 border rounded"
        >
          <option value="">Batch</option>
          {batches.map(batch => (
            <option key={batch.batchId} value={batch.batchId}>
              {`${batch.batchId} - (${new Date(batch.batch.uploadedAt).toLocaleString()})`}
            </option>
          ))}
        </select>
      </div>

      {/* Questions */}
      {!loading && !error && filteredQuestions.length > 0 && (
        <AddQuestionCard
          questions={filteredQuestions}
          fetchQuestions={fetchQuestions}
          page={page}
          limit={limit}
        />
      )}
      {!loading && !error && filteredQuestions.length === 0 && (
        <p>No questions found.</p>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          {/* <label htmlFor="limit" className="text-sm font-medium">Records per page:</label> */}
          <select
            id="limit"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // reset to first page when changing limit
            }}
            className="p-2 border rounded"
          >
            {[10, 20, 50, 100, 200, 500].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={page === 1}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalQuestions > 0 ? Math.ceil(totalQuestions / limit) : 1}
          </span>

          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={page >= Math.ceil(totalQuestions / limit)}
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};

export default AddQuestionInExam;
