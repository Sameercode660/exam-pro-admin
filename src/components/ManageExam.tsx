'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
}

function ManageExam() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<null | string>(null);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchExams(Number(localStorage.getItem('adminId')));
  }, []);

  const fetchExams = async (adminId: number) => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/fetch-all-exam`, { adminId });
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

  const handleDelete = async (id: number, adminId: number) => {
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
      fetchExams(Number(localStorage.getItem('adminId')));
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
      setDeleteLoading(false);
      setOpenDeletePopup(false);
    }
  };

  const handleEdit = (id: number) => {
    console.log(`Edit exam with id: ${id}`);
    // Add functionality for editing the exam here
  };

  const handleAddQuestion = (id: number) => {
    console.log(`Add question to exam with id: ${id}`);
    // Add functionality for adding questions here
  };

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
            fetchExams(Number(localStorage.getItem('adminId')))
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
                <div>
                  <h2 className="text-lg font-semibold">{exam.title}</h2>
                  <p>Description: {exam.description}</p>
                  <p>Exam Code: {exam.examCode}</p>
                  <p>Duration: {exam.duration} minutes</p>
                  <p>Status: {exam.status}</p>
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
                  <button
                    className="bg-sky-400 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => router.push(`/home/exams/exam-details/${exam.id}`)}
                  >
                    View
                  </button>
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
                          handleDelete(exam.id, Number(localStorage.getItem('adminId')));
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
