'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  totalAdmins: number;
  totalOrganizations: number;
}

const OverviewCards: React.FC<Props> = ({ totalAdmins, totalOrganizations }) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
      <div
        onClick={() => router.push('/home/super-admin/admins')}
        className="backdrop-blur-lg bg-white/70 border border-gray-200 rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl hover:bg-white/90 transition cursor-pointer"
      >
        <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Admins</h3>
        <p className="text-3xl font-extrabold text-gray-800 mt-2">{totalAdmins}</p>
      </div>

      <div
        onClick={() => router.push('/home/super-admin/organizations')}
        className="backdrop-blur-lg bg-white/70 border border-gray-200 rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl hover:bg-white/90 transition cursor-pointer"
      >
        <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Organizations</h3>
        <p className="text-3xl font-extrabold text-gray-800 mt-2">{totalOrganizations}</p>
      </div>

      <div className="backdrop-blur-lg bg-white/70 border border-gray-200 rounded-2xl shadow-xl p-6 flex items-center justify-center">
        <button
          onClick={() => router.push('/home/super-admin/create-admin')}
          className="px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:opacity-90 transition"
        >
          + Create Admin
        </button>
      </div>
    </div>
  );
};

export default OverviewCards;
