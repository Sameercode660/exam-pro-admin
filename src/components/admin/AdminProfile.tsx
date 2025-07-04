'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface AdminData {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  createdAt: string;
  updatedAt: string;
  createdExams: { id: number; title: string }[];
  updatedExams: { id: number; title: string }[];
  questions: { id: number; text: string }[];
  Category: { id: number; name: string }[];
  Topic: { id: number; name: string }[];
}

const AdminProfile = () => {
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('adminId');
    const fetchAdminData = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/authentication/admin-info`, { id });
        const data = response.data;

        if (data.status) {
          setAdminData(data.response);
        } else {
          console.error('Error:', data.message);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  if (!adminData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="shadow-lg rounded-xl bg-white p-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 mb-4 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold">
            {adminData.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold mb-2">{adminData.name}</h2>
          <p className="text-gray-600">{adminData.email}</p>
          <p className="text-gray-600">{adminData.mobileNumber}</p>
          <p className="text-gray-500 text-sm mt-2">Joined on {new Date(adminData.createdAt).toLocaleDateString()}</p>
          {/* <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">Edit Profile</button> */}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Created Exams</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminData.createdExams.map((exam) => (
            <div key={exam.id} className="p-4 shadow-md rounded-lg bg-gray-100">
              <h4 className="font-semibold text-md">{exam.title}</h4>
            </div>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Categories</h3>
        <ul className="flex flex-wrap gap-2">
          {adminData.Category.map((category) => (
            <span
              key={category.id}
              className="px-3 py-1 bg-gray-200 rounded-full text-sm"
            >
              {category.name}
            </span>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Topics</h3>
        <ul className="flex flex-wrap gap-2">
          {adminData.Topic.map((topic) => (
            <span
              key={topic.id}
              className="px-3 py-1 bg-blue-200 rounded-full text-sm"
            >
              {topic.name}
            </span>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminProfile;