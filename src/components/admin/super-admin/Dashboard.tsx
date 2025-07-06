'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface AdminInfo {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  role: 'SuperAdmin' | 'Admin' | 'SuperUser' | 'User';
}

export interface DashboardData {
  admin: AdminInfo;
  totalAdmins: number;
  totalOrganizations: number;
}

const Dashboard = () => {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [totalAdmins, setTotalAdmins] = useState<number>(0);
  const [totalOrganizations, setTotalOrganizations] = useState<number>(0);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminId = user?.id;
        const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/super-admin/dashboard-data`, {
          adminId,
        });
        setAdminInfo(res.data.admin);
        setTotalAdmins(res.data.totalAdmins);
        setTotalOrganizations(res.data.totalOrganizations);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 md:p-6 min-h-screen bg-gray-50">
      {/* Admin Info */}
      <div className="col-span-1 bg-white shadow-md rounded-lg p-4 border h-[80%]">
        <h2 className="text-xl font-semibold mb-4">Admin Info</h2>
        {adminInfo ? (
          <div className="space-y-1 text-sm">
            <p><strong>Name:</strong> {adminInfo.name}</p>
            <p><strong>Email:</strong> {adminInfo.email}</p>
            <p><strong>Mobile:</strong> {adminInfo.mobileNumber}</p>
            <p><strong>Role:</strong> {adminInfo.role}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Loading...</p>
        )}
      </div>

      {/* Right Section */}
      <div className="col-span-1 md:col-span-3 grid grid-rows-2 gap-4 h-[80%]">
        {/* Create Admin Button */}
        <div className="bg-white shadow-md rounded-lg flex items-center justify-center p-4 border h-full">
          <button onClick={() => {
            router.push('/home/super-admin/create-admin')
          }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Create Admin
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md p-4 text-center h-full flex justify-center items-center flex-col">
            <h3 className="text-sm font-medium">Total Admins</h3>
            <p className="text-2xl font-bold mt-1">{totalAdmins}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-md p-4 text-center h-full flex justify-center items-center flex-col">
            <h3 className="text-sm font-medium">Total Organizations</h3>
            <p className="text-2xl font-bold mt-1">{totalOrganizations}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
