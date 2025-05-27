'use client'

import axios from "axios";
import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [exams, setExams] = useState([
    { id: 1, name: "Math Exam" },
    { id: 2, name: "Science Exam" },
  ]);

  const [students, setStudents] = useState([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [showCreateExamPopup, setShowCreateExamPopup] = useState(false);

  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    examCode: "",
    duration: 0,
    status: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const generateExamCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const handleCreateExamChange = (e) => {
    const { name, value } = e.target;
    setNewExam({ ...newExam, [name]: value });
  };

  const handleCreateExam = () => {
    if (
      !newExam.title ||
      !newExam.description ||
      !newExam.duration ||
      !newExam.status
    ) {
      alert("Please fill out all fields!");
      return;
    }
    const newExamData = {
      ...newExam,
      id: exams.length + 1,
      examCode: newExam.examCode || generateExamCode(),
    };
    setExams([...exams, newExamData]);
    setShowCreateExamPopup(false);
    setNewExam({ title: "", description: "", examCode: "", duration: 0, status: "" });
  };

  const deleteExam = (id) => {
    setExams(exams.filter((exam) => exam.id !== id));
  };

  const addQuestion = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowCreateExamPopup(false);
    setSelectedFile(null);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/upload-questions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("File uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to upload file.");
    }
  };

  useEffect(() => {
    async function fetchExam() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_ROOT_URL}/fetch-exam`
        );
        setExams(response.data.response);
      } catch (error) {
        console.log(error);
        alert("Unable to fetch the exams");
      }
    }
    fetchExam();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-6xl p-6 bg-white rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Admin Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">Total Exams</h3>
            <p className="text-4xl font-bold">{exams.length}</p>
          </div>
          <div className="bg-purple-500 text-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">All Students</h3>
            <p className="text-4xl font-bold">{students.length}</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            Manage Exams
          </h3>
          <button
            onClick={() => setShowCreateExamPopup(true)}
            className="bg-green-500 text-white py-2 px-4 rounded-lg mb-4 shadow hover:bg-green-600"
          >
            Create Exam
          </button>
          <div className="space-y-4">
            {exams.map((exam: any) => (
              <div
                key={exam.id}
                className="flex justify-between items-center p-4 bg-gray-200 rounded-lg shadow"
              >
                <span>
                  {exam.title} (ID: {exam.id}, code: {exam.examCode})
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => addQuestion(exam.id)}
                    className="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600"
                  >
                    Add Question
                  </button>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add Question</h3>
            <button
              onClick={() => window.location.href = "/add-question"}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 mb-2"
            >
              Add Manually
            </button>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <button
              onClick={handleUpload}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 mb-2"
            >
              Upload Excel
            </button>
            <button
              onClick={closePopup}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
