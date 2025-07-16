'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

interface Option {
  text: string;
}

interface FormData {
  text: string;
  categoryName: string;
  topicName: string;
  difficulty: string;
  correctOption: number | null;
  options: Option[];
}

const UpdateQuestion: React.FC = () => {
  const params = useParams();
  const { questionId } = params;
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    text: '',
    categoryName: '',
    topicName: '',
    difficulty: '',
    correctOption: null,
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdateEnabled, setIsUpdateEnabled] = useState(false);

  useEffect(() => {
    if (!questionId || !user?.id) return;

    const fetchQuestion = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_ROOT_URL}/questions/fetch-single-question`,
          {
            questionId: Number(questionId),
            adminId: user.id,
          }
        );

        const question = response.data.response;

        if (!question) {
          setError('Question not found.');
          setLoading(false);
          return;
        }

        setFormData({
          text: question.text || '',
          categoryName: question.category?.name || '',
          topicName: question.topic?.name || '',
          difficulty: question.difficulty || '',
          correctOption:
            question.correctOption !== null ? Number(question.correctOption) : null,
          options:
            question.options?.length === 4
              ? question.options.map((opt: Option) => ({ text: opt.text }))
              : [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        });
      } catch (err) {
        setError('Failed to fetch question details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, user?.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (name === 'options' && index !== undefined) {
      const updatedOptions = [...formData.options];
      updatedOptions[index].text = value;
      setFormData({ ...formData, options: updatedOptions });
    } else if (name === 'correctOption') {
      setFormData({ ...formData, correctOption: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setIsUpdateEnabled(true);
  };

  const validateForm = () => {
    const { text, categoryName, topicName, difficulty, correctOption, options } = formData;

    if (!text || !categoryName || !topicName || !difficulty || !correctOption) {
      setError('Please fill in all fields and select correct option.');
      return false;
    }

    if (options.some((opt) => !opt.text.trim())) {
      setError('All options must have text.');
      return false;
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!questionId || !user?.id) {
      setError('Missing required data.');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_ROOT_URL}/questions/update-question`, {
        questionId: Number(questionId),
        ...formData,
        adminId: user.id,
      });

      toast.error('Question updated successfully!');
      router.push('/home/questions/manage-questions');
    } catch (err) {
      setError('Failed to update question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Update Question</h1>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && (
        <div className="space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Question Text</label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter question text"
            />
          </div>

          {/* Category & Topic */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700 font-semibold mb-1">Category Name</label>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-gray-700 font-semibold mb-1">Topic Name</label>
              <input
                type="text"
                name="topicName"
                value={formData.topicName}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter topic"
              />
            </div>
          </div>

          {/* Difficulty & Correct Option */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700 font-semibold mb-1">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="w-1/2">
              <label className="block text-gray-700 font-semibold mb-1">Correct Option</label>
              <select
                name="correctOption"
                value={formData.correctOption || ''}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Correct Option</option>
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    Option {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Options</label>
            {formData.options.map((option, index) => (
              <div key={index} className="relative mb-2">
                <input
                  name="options"
                  value={option.text}
                  onChange={(e) => handleInputChange(e, index)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
                {formData.correctOption === index + 1 && (
                  <span className="absolute right-3 top-3 text-green-600 text-xs font-semibold">
                    ✓ Correct
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={!isUpdateEnabled}
              className={`px-6 py-3 rounded-lg text-white font-semibold transition-all ${
                isUpdateEnabled
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Update Question
            </button>
          </div>
        </div>
      )}
      <ToastContainer position='top-center'></ToastContainer>
    </div>
  );
};

export default UpdateQuestion;
