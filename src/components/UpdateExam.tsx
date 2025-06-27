'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
 

const UpdateExam: React.FC = () => {
  const { examId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examCode, setExamCode] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [adminId, setAdminId] = useState<number>(0);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false); // To ensure initial data is loaded
  const router = useRouter()

  // To hold the initial state
  const initialStateRef = useRef({
    title: '',
    description: '',
    examCode: '',
    duration: '',
    status: '',
  });

  // Fetch adminId from localStorage on mount
  useEffect(() => {
    const storedAdminId = localStorage.getItem('adminId');
    if (storedAdminId) {
      setAdminId(Number(storedAdminId));
    }
  }, []);

  // Fetch exam data on component mount
  useEffect(() => {
    if (adminId === 0) return; // Avoid fetching if adminId is not yet set

    const fetchExamData = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_ROOT_URL}/exams/fetch-single-exam`,
          { examId, adminId }
        );

        if (response.data.status) {
          const exam = response.data.response;
          setTitle(exam.title);
          setDescription(exam.description);
          setExamCode(exam.examCode);
          setDuration(exam.duration.toString());
          setStatus(exam.status);

          // Set initial state in the ref
          initialStateRef.current = {
            title: exam.title,
            description: exam.description,
            examCode: exam.examCode,
            duration: exam.duration.toString(),
            status: exam.status,
          };

          setIsInitialDataLoaded(true); // Mark data as fully loaded
        } else {
          throw new Error(response.data.message);
        }
      } catch (err) {
        console.error('Error fetching exam data:', err);
        setError('Failed to fetch exam data.');
      }
    };

    fetchExamData();
  }, [examId, adminId]);

  // Detect changes in form fields
  useEffect(() => {
    if (!isInitialDataLoaded) return; // Ensure comparison only after initial data is loaded

    const isChanged =
      title !== initialStateRef.current.title ||
      description !== initialStateRef.current.description ||
      examCode !== initialStateRef.current.examCode ||
      duration !== initialStateRef.current.duration ||
      status !== initialStateRef.current.status;

    setIsModified(isChanged);
  }, [title, description, examCode, duration, status, isInitialDataLoaded]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isModified) return; // Prevent unnecessary API calls

    try {
      setLoading(true);

      const response = await axios.put(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/update-exam`, {
        id: Number(examId),
        adminId,
        title,
        description,
        examCode,
        duration: Number(duration),
        status,
        updatedByAdminId: adminId,
      });

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      alert('Exam updated successfully');
      
      router.push('/home/exams/manage-exams')
    } catch (err) {
      console.error('Error updating exam:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to update exam.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Update Exam</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}

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

        <div className="mb-4">
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
          disabled={!isModified || loading}
          className={`px-4 py-2 rounded ${loading || !isModified ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
        >
          {loading ? 'Updating...' : 'Update Exam'}
        </button>
      </form>
    </div>
  );
};

export default UpdateExam;
