'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const CreateGroupForm = () => {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Set default start date to today on load
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate('');
  };

  const resetError = () => {
    const id = setTimeout(() => {
      setError('');
      clearTimeout(id);
    }, 3000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const todayDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validation
    if (!name || !description || !startDate || !endDate) {
      setError('All fields are required.');
      setLoading(false);
      resetError();
      return;
    }

    if (start < new Date(todayDate.toDateString())) {
      setError('Start date cannot be in the past.');
      setLoading(false);
      resetError();
      return;
    }

    if (start >= end) {
      setError('Start date must be before end date.');
      setLoading(false);
      resetError();
      return;
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/create`, {
        name,
        description,
        startDate,
        endDate,
        createdById: Number(user?.id),
        organizationId: Number(user?.organizationId),
      });

      setSuccess('Group created successfully!');
      resetForm();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || 'Failed to create group.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create New Group</h2>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">{success}</div>}

      <div className="space-y-5">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]} // prevents selecting past dates
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
              required
            />
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupForm;
