'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { downloadUploadSummaryExcel } from '@/lib/summary-download';
import BatchSummaryPupup from './utils/BatchSummaryPupup';

function AddQuestion() {
  const [loading, setLoading] = useState(false);
  const [loadingSingleQuestion, setLoadingSigleQuestion] = useState(false)
  const [file, setFile] = useState<File | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [text, setText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const { user } = useAuth();
  const adminId = user?.id;
  const router = useRouter();
  const organizationId = user?.organizationId;

  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [title, setTitle] = useState<any>('');
  const [description, setDescription] = useState<any>('');

  const [open, setOpen] = useState(false);
  const [batchData, setBatchData] = useState({
    batchId: 0,
    batchStatus: "FAILED",
    failed: 0,
    inserted: 0,
    message: "Upload completed",
    skipped: 0,
  });

  // --------------------- suggestions ------------------------//
  useEffect(() => {
    if (organizationId) {
      fetchCategoriesAndTopics();
    }
  }, [organizationId]);

  const fetchCategoriesAndTopics = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/suggestions/category-topics`, {
        organizationId
      });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.log("Failed to fetch categories/topics", err);
    }
  };

  // handle category typing
  const handleCategoryChange = (value: string) => {
    setTitle(value); // reuse `title` or make separate `categoryInput`
    setFilteredCategories(
      categories.filter((c) => c.name.toLowerCase().includes(value.toLowerCase()))
    );
  };

  const handleCategorySelect = (cat: any) => {
    setSelectedCategory(cat);
    setTitle(cat.name); // fill input
    setFilteredCategories([]);
    setTopics(cat.topics);
  };

  // handle topic typing
  const handleTopicChange = (value: string) => {
    setDescription(value); // reuse or make `topicInput`
    setFilteredTopics(
      topics.filter((t) => t.name.toLowerCase().includes(value.toLowerCase()))
    );
  };

  const handleTopicSelect = (topic: any) => {
    setDescription(topic.name);
    setFilteredTopics([]);
  };

  // ----------------------------- end -------------------------//

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/questions/file-question-upload?adminId=${adminId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(response.data);
      downloadUploadSummaryExcel(response.data.summaryData, "Question");
      setOpen(true)
      setBatchData({
        batchId: response.data.batchId,
        batchStatus: response.data.batchStatus,
        failed: response.data.failed,
        inserted: response.data.inserted,
        message: response.data.message,
        skipped: response.data.skipped,
      })

      toast.success('File uploaded successfully');
      // router.push('/home/questions/manage-questions');
    } catch (error) {
      console.log(error)
      toast.error('Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    const data = {
      categoryName: title,
      topicName: description,
      text,
      option1,
      option2,
      option3,
      option4,
      correctOption: Number(correctOption),
      difficultyLevel,
      adminId,
      organizationId
    };

    console.log(data)

    if (
      !data.categoryName ||
      !data.topicName ||
      !text ||
      !option1 ||
      !option2 ||
      !option3 ||
      !option4 ||
      !correctOption ||
      !difficultyLevel ||
      !adminId
    ) {
      toast.error('All fields are required!');
      return;
    }

    try {
      setLoadingSigleQuestion(true);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/questions/add-single-question`, data);

      if (response.data.status) {
        toast.success('Question uploaded successfully');
        router.push('/home/questions/manage-questions');
      } else {
        toast.error('Unable to upload the question');
      }
    } catch (error: any) {
      console.error('API Error:', error.message);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoadingSigleQuestion(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl mx-auto mt-10 space-y-8 border border-gray-200">
      <BatchSummaryPupup
        data={batchData}
        isOpen={open}
        onClose={() => setOpen(false)}
        redirectPath='/home/questions/manage-questions'
      />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Questions</h2>

        <a
          href="https://docs.google.com/spreadsheets/d/1wL7cgUMj9Nbi_sS8RWn_wMLZVyUCqgYy/export?format=xlsx"
          download
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm font-medium"
        >
          📥 Download Excel Template
        </a>
      </div>



      {/* File Upload Section */}
      <div className="space-y-4">
        <p className="text-gray-600">
          Upload questions using an Excel file. Ensure the file follows the correct format.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <label className="w-full md:w-2/3 px-4 py-2 border rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-600 truncate">
            {file ? file.name : "Select a file for upload"}
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={handleFileUpload}
            disabled={loading}
            className={`bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading && <Loader2 className="animate-spin w-5 h-5" />}
            {loading ? 'Uploading...' : 'Upload Questions'}
          </button>
        </div>
      </div>

      {/* Single Question Form Section */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-700">Add Question</h3>

        <div className="space-y-4">

    {/* category */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Category"
            />
            {filteredCategories.length > 0 && (
              <ul className="absolute bg-white border rounded-xl mt-1 w-full max-h-40 overflow-y-auto shadow-md z-10">
                {filteredCategories.map((cat) => (
                  <li
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {cat.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

            {/* topic  */}

          <div className="relative mt-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Topic</label>
            <input
              type="text"
              value={description}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Topic"
            />
            {filteredTopics.length > 0 && (
              <ul className="absolute bg-white border rounded-xl mt-1 w-full max-h-40 overflow-y-auto shadow-md z-10">
                {filteredTopics.map((topic) => (
                  <li
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {topic.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <textarea
            placeholder="Question Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Option 1"
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Option 2"
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Option 3"
              value={option3}
              onChange={(e) => setOption3(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Option 4"
              value={option4}
              onChange={(e) => setOption4(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Correct Option</option>
              <option value="1">Option: 1</option>
              <option value="2">Option: 2</option>
              <option value="3">Option: 3</option>
              <option value="4">Option: 4</option>
            </select>

            <select
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Difficulty Level</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <button
            onClick={handleFormSubmit}
            disabled={loadingSingleQuestion}
            className={`bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading && <Loader2 className="animate-spin w-5 h-5" />}
            {loadingSingleQuestion ? 'Uploading...' : 'Add Question'}
          </button>
        </div>
      </div>
      <ToastContainer position='top-center'></ToastContainer>
    </div>
  );
}

export default AddQuestion;
