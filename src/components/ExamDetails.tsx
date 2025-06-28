'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import ExamDetailsCard from './ExamDetailsCard';

const ExamDetails = () => {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { examId } = useParams();

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
  const fetchExamQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/fetch-exam-question`, {
        examId: Number(examId),
      });
      setQuestions(response.data.questions || []);
      setFilteredQuestions(response.data.questions || []);
    } catch (err) {
      console.error('Error fetching exam questions:', err);
      setError('Failed to fetch questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search to the questions
  const applyFilters = () => {
    let filtered = [...questions];

    if (selectedCategory) {
      filtered = filtered.filter((q: any) => q.categoryId === selectedCategory);
    }

    if (selectedTopic) {
      filtered = filtered.filter((q: any) => q.topicId === selectedTopic);
    }

    if (difficulty) {
      filtered = filtered.filter((q: any) => q.difficulty === difficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter((q: any) =>
        q.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  // Handle search and filters on user input
  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedTopic, difficulty, searchTerm, questions]);

  // Fetch data on component mount
  useEffect(() => {
    fetchExamQuestions();
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

  // Paginated questions
  const paginatedQuestions = filteredQuestions.slice(
    (page - 1) * limit,
    page * limit
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Added Question</h1>

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
      {!loading && !error && paginatedQuestions.length > 0 && (
        <ExamDetailsCard
          questions={paginatedQuestions}
          fetchExamQuestions={fetchExamQuestions}
          page={page}
        />
      )}
      {!loading && !error && paginatedQuestions.length === 0 && (
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
          disabled={paginatedQuestions.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExamDetails;
