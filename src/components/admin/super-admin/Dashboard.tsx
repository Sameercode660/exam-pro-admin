'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const [totalAdmins, setTotalAdmins] = useState<number>(0);
  const [totalOrganizations, setTotalOrganizations] = useState<number>(0);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminId = user?.id;
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_ROOT_URL}/super-admin/dashboard-data`,
          { adminId }
        );
        setTotalAdmins(res.data.totalAdmins);
        setTotalOrganizations(res.data.totalOrganizations);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-8 flex items-center justify-center">
      {/* Big Card Container */}
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-6xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Super Admin Dashboard</h2>

        {/* 2x2 Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mini Card 1 */}
          <div
            onClick={() => router.push('/home/super-admin/admins')}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col justify-center items-center hover:shadow-2xl transition cursor-pointer"
          >
            <h3 className="text-gray-500 text-lg font-semibold">Total Admins</h3>
            <p className="text-4xl font-bold text-gray-800 mt-4">{totalAdmins}</p>
          </div>

          {/* Mini Card 2 */}
          <div
            onClick={() => router.push('/home/super-admin/organizations')}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col justify-center items-center hover:shadow-2xl transition cursor-pointer"
          >
            <h3 className="text-gray-500 text-lg font-semibold">Total Organizations</h3>
            <p className="text-4xl font-bold text-gray-800 mt-4">{totalOrganizations}</p>
          </div>

          {/* Mini Card 3 */}
          <div
            onClick={() => router.push('/home/super-admin/create-admin')}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col justify-center items-center hover:shadow-2xl transition cursor-pointer"
          >
            <h3 className="text-gray-500 text-lg font-semibold mb-4">Create Admin</h3>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition">
              + Create
            </button>
          </div>

          {/* Mini Card 4 */}
          <div
            onClick={() => alert('Report Coming Soon')}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col justify-center items-center hover:shadow-2xl transition cursor-pointer"
          >
            <h3 className="text-gray-500 text-lg font-semibold mb-4">Generate Report</h3>
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition">
              Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
