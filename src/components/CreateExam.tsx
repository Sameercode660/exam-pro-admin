'use client';

import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CreateExam() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examCode, setExamCode] = useState('');
  const [duration, setDuration] = useState(''); // Used in both scheduled and non-scheduled
  const [status, setStatus] = useState('Active');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [scheduleMode, setScheduleMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [minDateTime, setMinDateTime] = useState('');

  const { user } = useAuth();
  const router = useRouter();
  const adminId = user?.id;

  useEffect(() => {
    generateExamCode();
    setMinDateTime(getCurrentDateTime());
  }, []);

 useEffect(() => {
  if (scheduleMode && startTime && duration) {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + Number(duration) * 60000);

    // Converting to local datetime-local format (yyyy-MM-ddTHH:mm)
    const localEnd = new Date(end.getTime() - end.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setEndTime(localEnd);
  }
}, [scheduleMode, startTime, duration]);

  const generateExamCode = () => {
    const randomCode = `EX-${Math.floor(100000 + Math.random() * 900000)}`;
    setExamCode(randomCode);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        title,
        description,
        examCode,
        duration: Number(duration),
        status: scheduleMode ? 'Scheduled' : status,
        startTime: scheduleMode && startTime ? startTime : null,
        endTime: scheduleMode && endTime ? endTime : null,
        createdByAdminId: adminId,
      };

      const response = await axios.post('http://localhost:3000/api/exams/create-exam', payload);
      console.log(response.data)

      toast.success('Exam created successfully');
      router.push('/home/exams/manage-exams');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl mx-auto mt-10 space-y-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800">Create New Exam</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div className='flex justify-between w-full gap-3'>
          <div className='w-[50%]'>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {!scheduleMode && (
            <div className='w-[50%]'>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="schedule"
            checked={scheduleMode}
            onChange={(e) => setScheduleMode(e.target.checked)}
            className="w-5 h-5 text-blue-600"
          />
          <label htmlFor="schedule" className="text-gray-700 font-medium">Schedule this Exam</label>
        </div>

        {scheduleMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min={minDateTime}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {startTime && duration && (
              <div className="md:col-span-2 text-gray-600 text-sm">
                <strong>Auto End Time:</strong> {endTime.replace('T', ' ')}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />}
          {loading ? 'Creating...' : 'Create Exam'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default CreateExam;
