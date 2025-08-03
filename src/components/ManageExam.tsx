'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

interface Admin {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  examCode: string;
  duration: number;
  status: string;
  createdByAdminId: number;
  updatedByAdminId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: Admin;
  updatedBy: Admin;
  startTime: string;
  endTime: string;
}

function ManageExam() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const adminId = user?.id;

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/fetch-all-exam`, { adminId });
      setExams(response.data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return alert('Input text to search');
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/exam-search`, { query: searchQuery });
      setExams(response.data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleteLoading(true);
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/delete-exam`, {
        examId: deleteTargetId,
        adminId,
      });
      fetchExams();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
      setDeleteTargetId(null);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading exams...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search exams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
        />
        <div className="flex gap-2">
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Search
          </button>
          <button onClick={fetchExams} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
            All Exams
          </button>
        </div>
      </div>

      {exams.length === 0 ? (
        <p className="text-center text-gray-500">No exams found.</p>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id} className="border p-5 rounded-xl shadow-md bg-white flex justify-between items-start">
              <div className="space-y-2">
                <h2
                  onClick={() => router.push(`/home/exams/exam-details/${exam.id}`)}
                  className="text-xl font-bold text-blue-600 underline cursor-pointer"
                >
                  {exam.title.toUpperCase()}
                </h2>
                <p className="text-gray-600 font-medium">{exam.description}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">{exam.examCode}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">{exam.duration} min</span>
                  {exam.status === "Scheduled" ? (
                    <div className="flex flex-col text-sm bg-yellow-100 text-yellow-800 rounded px-2 py-1 font-semibold">
                      <span>Scheduled</span>
                      <span>
                        {new Date(exam.startTime).toLocaleString()} - {new Date(exam.endTime).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`px-3 py-1 text-sm rounded-full font-semibold text-white ${
                        exam.status === "Active" ? 'bg-green-500' :
                        exam.status === "Inactive" ? 'bg-gray-400' :
                        exam.status === "Completed" ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`}
                    >
                      {exam.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setDeleteTargetId(exam.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => router.push(`/home/exams/update-exam/${exam.id}`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => router.push(`/home/exams/add-question/${exam.id}`)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Add Question
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">Delete Exam</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this exam? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageExam;
