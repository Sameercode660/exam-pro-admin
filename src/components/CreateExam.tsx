'use client';

import React, { useState, useEffect } from 'react';

function CreateExam() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    examCode: '',
    duration: '',
    status: '',
    createdByAdminId: Number(localStorage.getItem('adminId')) || 1,
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Generate a random exam code
  const generateExamCode = () => {
    const randomCode = `EX-${Math.floor(Math.random() * 999999)}`;
    setFormData((prev) => ({ ...prev, examCode: randomCode }));
  };

  // Generate the exam code on component mount
  useEffect(() => {
    generateExamCode();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('http://localhost:3000/api/exams/create-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create the exam. Please check your inputs and try again.');
      }

      const data = await response.json();
      setSuccessMessage('Exam created successfully!');
      console.log('Server Response:', data);

      setFormData({
        title: '',
        description: '',
        examCode: '',
        duration: '',
        status: '',
        createdByAdminId: Number(localStorage.getItem('adminId')) || 1,
      });

      generateExamCode(); // Generate a new code for a fresh form
    } catch (err: any) {
      setError(err.message);
      console.error('Error:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Exam</h2>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {successMessage && <div className="mb-4 text-green-600">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            rows={4}
            required
          ></textarea>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="w-full">
            <label htmlFor="examCode" className="block text-sm font-medium mb-2">
              Exam Code
            </label>
            <input
              type="text"
              id="examCode"
              name="examCode"
              value={formData.examCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="button"
            onClick={generateExamCode}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Generate Code
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="duration" className="block text-sm font-medium mb-2">
            Duration (in minutes)
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Exam
        </button>
      </form>
    </div>
  );
}

export default CreateExam;
