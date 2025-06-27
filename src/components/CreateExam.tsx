'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

function CreateExam() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examCode, setExamCode] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState('');
  const [adminId, setAdminId] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Generate a random exam code
  const generateExamCode = () => {
    const randomCode = `EX-${Math.floor(Math.random() * 999999)}`;
    setExamCode(randomCode);
  };

  useEffect(() => {
    generateExamCode();
    setAdminId(Number(localStorage.getItem('adminId')));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const response = await axios.post('http://localhost:3000/api/exams/create-exam', {
        title,
        description,
        examCode,
        duration: Number(duration),
        status,
        createdByAdminId: adminId,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setLoading(false);

      if (response.data.status === false) {
        alert('Unable to create the exam');
        return;
      }

      alert('Exam Created Successfully');
      router.push('/home/exams/manage-exams');

      setTitle('');
      setDescription('');
      generateExamCode(); // Generate a new code for a fresh form
      setDuration('');
      setStatus('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Exam</h2>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              disabled
              type="text"
              id="examCode"
              value={examCode}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          {/* <button
            type="button"
            onClick={generateExamCode}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Generate Code
          </button> */}
        </div>

        <div className="mb-4">
          <label htmlFor="duration" className="block text-sm font-medium mb-2">
            Duration (in minutes)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
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
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
          {loading ? 'Loading...' : 'Create Exam'}
        </button>
      </form>
    </div>
  );
}

export default CreateExam;
