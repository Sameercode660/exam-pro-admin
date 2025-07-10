'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface AdminHeaderProps {
  adminName: string;
}

const DashboardHeading: React.FC<AdminHeaderProps> = ({ adminName }) => {
  const initial = adminName.charAt(0).toUpperCase();
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
        <div className='flex'>
          <span className="text-lg font-handwriting">{adminName}</span>
          <span className="text-lg font-handwriting">Profile</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeading;