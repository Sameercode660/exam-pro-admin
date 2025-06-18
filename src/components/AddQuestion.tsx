'use client';

import React, { use, useEffect, useState } from 'react';
import Loader from './Loader';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function AddQuestion() {

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [text, setText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState('EASY');
  const [adminId, setAdminId] = useState<number | null>(0);
  const router = useRouter();

  useEffect(() => {
    setAdminId(Number(localStorage.getItem('adminId')));
  }, [])

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_URL}/questions/file-question-upload?adminId=${adminId}`, {
        method: 'POST',
        body: formData,
      });
      setLoading(false)
      if (!response.ok) {
        alert('Failed to upload file');
        return;
      }

      const result = await response.json();
      alert('File uploaded successfully');
      router.push('/home/manage-questions')
      console.log('Server Response:', result);
    } catch (error) {
      alert('Error uploading file');
      console.error('Error:', error);
    } finally {
      setLoading(false)
    }
  };


  const handleFormSubmit = async () => {
    const data = {
      categoryName,
      topicName,
      text,
      option1,
      option2,
      option3,
      option4,
      correctOption,
      difficultyLevel,
      adminId
    }
    console.log(data);
    if (!categoryName || !topicName || !text || !option1 || !option2 || !option3 || !option4 || !correctOption || !difficulty || !adminId) {
      alert('Anyone field is empty!');
      return;
    }

    try {

      setLoading(true);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/questions/add-single-question`, data);
      
      setLoading(false);

      if(response.data.status) {
        alert('Question uploaded successfully.');
      } else {
        alert('Unable to upload the question.');
      }

    } catch (error) {

      if (error instanceof Error) {
        console.error('API Error:', error.message);
        alert('Something went wrong while uplading question. Please try again later.');

      } else {
        console.error('Unexpected Error:', error);
        alert('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Questions</h2>

      {/* File Upload Section */}
      <div className="mb-6">
        <p className="mb-4 text-gray-600">
          You can upload questions directly using an Excel file. Please ensure the file follows the correct format.
        </p>
        <label htmlFor="fileUpload" className="block text-sm font-medium mb-2">
          Upload Excel File
        </label>
        <input
          type="file"
          id="fileUpload"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border rounded"
        />
        <button
          type="button"
          onClick={handleFileUpload}
          className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${loading ? 'disabled': ''}`}
        >{loading ? 'Uploading...' : 'Upload Questions'}
        </button>
      </div>

      {/* Single Question Form Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Add a Single Question</h3>
        <div>

          {/* category name input  */}
          <div className="mb-4">
            <label htmlFor="categoryName" className="block text-sm font-medium mb-2">Category Name</label>
            <input
              type="text"
              id="categoryName"
              name="categoryName"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value)
              }}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {/* topic name field  */}

          <div className="mb-4">
            <label htmlFor="topicId" className="block text-sm font-medium mb-2">Topic Name</label>
            <input
              type="text"
              id="topicName"
              name="topicName"
              value={topicName}
              onChange={(e) => {
                setTopicName(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {/* question text input  */}
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium mb-2">Question Text</label>
            <textarea
              id="text"
              name="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              required
            ></textarea>
          </div>

          {/* topic 1 input field  */}
          <div className="mb-4">
            <label htmlFor="option1" className="block text-sm font-medium mb-2">
              Option 1
            </label>
            <input
              type="text"
              id="option1"
              name="option1"
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="option2" className="block text-sm font-medium mb-2">
              Option 2
            </label>
            <input
              type="text"
              id="option2"
              name="option2"
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="option3" className="block text-sm font-medium mb-2">
              Option 3
            </label>
            <input
              type="text"
              id="option3"
              name="option3"
              value={option3}
              onChange={(e) => setOption3(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="option4" className="block text-sm font-medium mb-2">
              Option 4
            </label>
            <input
              type="text"
              id="option4"
              name="option4"
              value={option4}
              onChange={(e) => setOption4(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          {/* ends here options input */}
          {/* correct option input starts from here  */}
          <div className="mb-4">
            <label htmlFor="correctOption" className="block text-sm font-medium mb-2">Correct Option (Index)</label>
            <input
              type="number"
              id="correctOption"
              name="correctOption"
              value={correctOption}
              onChange={(e) => {
                setCorrectOption(e.target.value)
              }}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="difficulty" className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              value={difficultyLevel}
              onChange={(e) => {
                setDifficultyLevel(e.target.value)
              }}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <button
            onClick={handleFormSubmit}
            type="submit"
            className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${loading ? 'disabled': ''}`}
          >
            {loading ? "Uploading..." : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddQuestion;

