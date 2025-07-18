'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<null | string>(null);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const adminId = user?.id

  const fetchExams = async () => {
    try {
      setLoading(true);
      console.log(adminId)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/fetch-all-exam`, { adminId });
      console.log(response)
      setExams(response.data.response);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const handleSearch = async () => {

    if (!searchQuery) {
      alert('Input text to search');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/exam-search`, {
        query: searchQuery
      });
      setExams(response.data.results);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/delete-exam`, {
        examId: id,
        adminId
      });

      setDeleteLoading(false);
      setOpenDeletePopup(false);
      if (response.data.status == false) {
        alert(response.data.message);
        return
      }
      fetchExams();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
      setDeleteLoading(false);
      setOpenDeletePopup(false);
    }
  };

  useEffect(() => {
    fetchExams()
  }, [])

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Exams</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search exams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <button
          onClick={handleSearch}
          className="mt-2 mr-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
        <button
          onClick={() => {
            fetchExams()
          }}
          className="mt-2 ml-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          All Exam
        </button>
      </div>

      {exams.length === 0 ? (
        <p>No exams found.</p>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id}>
              <div
                key={exam.id}
                className="border p-4 rounded-lg shadow-md bg-white flex justify-between items-center"
              >
                <div className='flex flex-col space-y-1.5'>
                  <h2 className="text-lg font-semibold text-blue-400 underline cursor-pointer" onClick={() => router.push(`/home/exams/exam-details/${exam.id}`)}>{exam.title.toUpperCase()}</h2>
                  <p className='font-semibold text-gray-500'>{exam.description}</p>
                  <div className='flex space-x-5'>
                    <p className='font-semibold text-gray-500 text-sm bg-gray-200 flex justify-center items-center rounded pl-2 pr-2'> {exam.examCode}</p>
                    <p className='font-semibold text-gray-500 text-sm bg-gray-200 flex justify-center items-center rounded pl-2 pr-2'>{exam.duration} minutes</p>
                    {exam.startTime && exam.endTime ? (
                      <div className="flex flex-col bg-green-200 text-yellow-800 rounded px-2 py-1 text-sm font-semibold">
                        <span>Scheduled</span>
                        <span>{new Date(exam.startTime).toLocaleString()} - {new Date(exam.endTime).toLocaleString()}</span>
                      </div>
                    ) : (
                      <p className={`font-semibold text-gray-500 text-sm ${exam.status == "Active" ? 'bg-green-500' : exam.status == "Inactive" ? 'bg-yellow-200' : 'bg-blue-200'} flex justify-center items-center rounded pl-2 pr-2`}>
                        {exam.status || "Status Not Set"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={() => setOpenDeletePopup(true)}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => {
                      router.push(`/home/exams/update-exam/${exam.id}`)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => router.push(`/home/exams/add-question/${exam.id}`)}
                  >
                    Add Question
                  </button>
                  {/* (commented on 18/07/2025 -> applied same feature to title) */}
                  {/* <button
                    className="bg-sky-400 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => router.push(`/home/exams/exam-details/${exam.id}`)}
                  >
                    View
                  // </button> */}
                </div>
              </div>

              {
                openDeletePopup ? (<div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
                    <p className="text-gray-600 mb-6">Do you really want to delete this item.</p>
                    <div className="flex justify-end space-x-4">
                      <button
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                        onClick={() => {
                          setOpenDeletePopup(false)
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                        disabled={deleteLoading}
                        onClick={() => {
                          handleDelete(exam.id);
                        }}
                      >
                        {deleteLoading ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>) : (<></>)
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageExam;
