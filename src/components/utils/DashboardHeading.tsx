'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import React from 'react';


const DashboardHeading = () => {
  const {user} = useAuth()
  const adminName = user?.name;
  const initial = adminName?.charAt(0).toUpperCase();
  const router = useRouter();
  return (
    <div className="flex justify-between p-5 bg-gray-500 text-white">
      <h1 className="text-xl font-handwriting">ExamPro</h1>

      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => {
        router.push('/home/admin-profile')
      }}>
        <div className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-semibold">
          {initial}
        </div>
        <div className='flex flex-col'>
          <span className="text-lg font-handwriting">{adminName}</span>
          <span className="text-[8px] font-handwriting text-blue underline">Profile</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeading;