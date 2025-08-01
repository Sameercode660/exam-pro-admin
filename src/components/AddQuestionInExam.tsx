'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddQuestionCard from './AddQuestionCard';
import { useParams } from 'next/navigation';
const AddQuestionInExam = () => {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1); // Current page
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // Searching state

  const limit = 10; // Number of questions per page

  // Fetch Categories
  const fetchCategories = async () => {
    setError('');
    const adminId = Number(localStorage.getItem('adminId')) || 1;
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/filtering/fetch-category`, { adminId });
      setCategories(response.data || []);
    } catch (err) {
      setError('Failed to fetch categories. Please try again later.');
      console.error(err);
    }
  };

  // Fetch Topics for the Selected Category
  const fetchTopics = async (categoryId: number) => {
    setError('');
    const adminId = localStorage.getItem('adminId');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/filtering/fetch-topics`, { categoryId, adminId });
      setTopics(response.data || []);
    } catch (err) {
      setError('Failed to fetch topics. Please try again later.');
      console.error(err);
    }
  };

  // Fetch Questions
  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    const adminId = Number(localStorage.getItem('adminId')) || 1;

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_URL}/filtering/filters-questions`, {
        params: {
          adminId,
          categoryId: selectedCategory || undefined,
          topicId: selectedTopic || undefined,
          difficulty: difficulty || undefined,
          page,
          limit,
        },
      });
      setQuestions(response.data.response || []);
    } catch (err) {
      setError('Failed to fetch questions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Questions by Search
  const searchQuestions = async () => {
    if (!searchTerm) return; // Skip if search term is empty
    setLoading(true);
    setError('');
    const adminId = Number(localStorage.getItem('adminId')) || 1;

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_URL}/filtering/search`, {
        params: {
          adminId,
          questionTitle: searchTerm,
        },
      });
      setQuestions(response.data.response || []);
    } catch (err) {
      setError('Failed to search questions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all questions and categories on first render
  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, []);

  // Fetch topics when a category is selected
  useEffect(() => {
    if (selectedCategory !== null) {
      fetchTopics(selectedCategory);
    } else {
      setTopics([]);
    }
  }, [selectedCategory]);

  // Fetch questions when filters or page change
  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, selectedTopic, difficulty, page]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Question</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by question title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <button
          onClick={searchQuestions}
          className="px-4 py-2 mt-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 m-1"
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearchTerm('')
            fetchQuestions()
          }}
          className="px-4 py-2 mt-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 m-1"
        >
          All Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
          className="p-2 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={selectedTopic || ''}
          onChange={(e) => setSelectedTopic(Number(e.target.value) || null)}
          className="p-2 border rounded"
          disabled={!topics.length}
        >
          <option value="">Select Topic</option>
          {topics.map((topic: any) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>

        <select
          value={difficulty || ''}
          onChange={(e) => setDifficulty(e.target.value || null)}
          className="p-2 border rounded"
        >
          <option value="">Select Difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Question List */}
      {!loading && !error && questions.length > 0 && (
        <AddQuestionCard questions={questions} fetchQuestions={fetchQuestions} page={page} />
      )}
      {!loading && !error && questions.length === 0 && (
        <p>No questions available. Please refine your filters.</p>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          disabled={questions.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AddQuestionInExam;
