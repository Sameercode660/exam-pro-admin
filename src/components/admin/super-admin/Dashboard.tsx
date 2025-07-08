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
    <div className="p-6 min-h-screen bg-white flex flex-col items-center gap-6">
      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <div className="bg-white border rounded-lg shadow-sm p-4 text-center cursor-pointer" onClick={() => {
          router.push('/home/super-admin/admins')
        }}>
          <h3 className="text-sm font-medium">Total Admins</h3>
          <p className="text-2xl font-bold mt-1">{totalAdmins}</p>
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-4 text-center cursor-pointer" onClick={() => {
          router.push('/home/super-admin/organizations')
        }}>
          <h3 className="text-sm font-medium">Total Organizations</h3>
          <p className="text-2xl font-bold mt-1">{totalOrganizations}</p>
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-4 flex items-center justify-center">
          <button
            onClick={() => router.push('/home/super-admin/create-admin')}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 transition"
          >
            Create Admin
          </button>
        </div>
      </div>

      {/* Report Button */}
      <div className="w-full max-w-4xl flex justify-center">
        <button className="w-full md:w-1/2 px-6 py-3 border rounded-md text-lg font-medium hover:bg-gray-100 transition">
          Report
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
