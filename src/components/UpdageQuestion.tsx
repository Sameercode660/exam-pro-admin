'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

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

  const [formData, setFormData] = useState<FormData>({
    text: '',
    categoryName: '',
    topicName: '',
    difficulty: '',
    correctOption: null,
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
  });
  const [initialData, setInitialData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdateEnabled, setIsUpdateEnabled] = useState(false);

  // Fetch question details
  const fetchQuestion = async () => {
    if (!questionId) {
      setError('Question ID is missing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const adminId = Number(localStorage.getItem('adminId')) || 1;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/questions/fetch-single-question`, {
        questionId: Number(questionId),
        adminId,
      });

      const question = response.data.response;
      const fetchedFormData: FormData = {
        text: question.text,
        categoryName: question.category?.name || '',
        topicName: question.topic?.name || '',
        difficulty: question.difficulty,
        correctOption: Number(question.correctOption),
        options: question.options.map((opt: Option) => ({ text: opt.text })),
      };

      setFormData(fetchedFormData);
      setInitialData(fetchedFormData);
    } catch (err) {
      setError('Failed to fetch question details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  // Update form data and enable update button if changes are made
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (name === 'options' && index !== undefined) {
      const updatedOptions = [...formData.options];
      updatedOptions[index].text = value;
      setFormData({ ...formData, options: updatedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setIsUpdateEnabled(JSON.stringify(formData) !== JSON.stringify(initialData));
  };

  // Update question
  const handleUpdate = async () => {
    if (!questionId) {
      alert('Question ID is missing');
      return;
    }

    setLoading(true);
    setError('');
    console.log(formData)
    try {
      const adminId = Number(localStorage.getItem('adminId')) || 1;
      const response = await axios.put(`${process.env.NEXT_PUBLIC_ROOT_URL}/questions/update-question`, {
        questionId: Number(questionId),
        ...formData,
        adminId,
      });

      alert('Question updated successfully!');
      router.push('/home/questions/manage-questions');
    } catch (err) {
      setError('Failed to update question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">Update Question</h1>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold">Question Text</label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700 font-semibold">Category Name</label>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-gray-700 font-semibold">Topic Name</label>
              <input
                type="text"
                name="topicName"
                value={formData.topicName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700 font-semibold">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={(e) => {
                  handleInputChange(e)
                  setIsUpdateEnabled(true)
                }}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="w-1/2">
              <label className="block text-gray-700 font-semibold">Correct Option</label>
              <select
                name="correctOption"
                value={formData.correctOption || ''}
                onChange={(e) => {
                  handleInputChange(e)
                  setIsUpdateEnabled(true)
                }}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label className="block text-gray-700 font-semibold">Options</label>
            {formData.options.map((option, index) => (
              <input
                key={index}
                name="options"
                value={option.text}
                onChange={(e) => {
                  handleInputChange(e, index)
                }}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                placeholder={`Option ${index + 1}`}
              />
            ))}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={!isUpdateEnabled}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                isUpdateEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Update Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateQuestion;
