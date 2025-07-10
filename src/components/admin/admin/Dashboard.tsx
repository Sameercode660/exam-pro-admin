'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

const Dashboard = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Sidebar: Small Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4">
          <StatCard title="Users" value={24} />
          <StatCard title="Participants" value={120} />
          <StatCard title="Exams" value={12} />
          <StatCard title="Questions" value={456} />
          <StatCard title="Active Exams" value={8} />
          <StatCard title="Inactive Exams" value={4} />
        </div>

        {/* Right Section: Full Height Reports and Approvals */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <BigCard title="📊 Reports" />
          <BigCard title="✅ Approvals (34)" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
    <h3 className="text-xs font-medium text-gray-700">{title}</h3>
    <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

const ActionCard = ({ title, onClick }: { title: string; onClick?: () => void }) => (
  <div
    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center cursor-pointer hover:shadow-md transition"
    onClick={onClick}
  >
    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
  </div>
);

const BigCard = ({ title }: { title: string }) => (
  <div className="flex-1 bg-white border border-gray-300 rounded-2xl shadow-md p-10 flex items-center justify-center text-center text-2xl font-bold text-gray-800">
    {title}
  </div>
);

export default Dashboard;
